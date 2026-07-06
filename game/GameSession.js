/**
 * @module game/GameSession
 * @description Класс игровой сессии GeoGuesser.
 * Управляет раундами, таймерами, подсчётом очков и взаимодействием с каналом.
 */

'use strict';

const { AttachmentBuilder } = require('discord.js');
const { calculateScore } = require('./scoring');
const { checkAnswer } = require('../utils/answerChecker');
const {
  roundEmbed,
  correctGuessEmbed,
  roundEndEmbed,
  scoreboardEmbed,
  nextRoundEmbed,
  alreadyGuessedEmbed,
} = require('../utils/embeds');
const { fetchImageForLocation } = require('../services/wikimedia');
const locations = require('../data/locations');

/** Время на ответ в раунде (мс) */
const ROUND_TIMEOUT_MS = 90_000;

/** Задержка перед следующим раундом (мс) */
const NEXT_ROUND_DELAY_MS = 5_000;

/** Максимум попыток найти локацию с изображением */
const MAX_IMAGE_RETRIES = 5;

class GameSession {
  /**
   * Создаёт новую игровую сессию.
   *
   * @param {string} channelId - ID Discord канала
   * @param {"easy"|"medium"|"hard"} difficulty - Сложность игры
   * @param {string} startedBy - ID пользователя, запустившего игру
   */
  constructor(channelId, difficulty, startedBy) {
    /** @type {string} ID канала */
    this.channelId = channelId;

    /** @type {string} Сложность */
    this.difficulty = difficulty;

    /** @type {number} Текущий номер раунда */
    this.round = 0;

    /** @type {boolean} Активна ли сессия */
    this.isActive = true;

    /** @type {string} ID пользователя, запустившего игру */
    this.startedBy = startedBy;

    /** @type {Map<string, { username: string, points: number, correctGuesses: number, exactGuesses: number }>} */
    this.scores = new Map();

    /** @type {Set<number>} Использованные ID локаций */
    this.usedLocationIds = new Set();

    /** @type {Object|null} Текущая локация */
    this.currentLocation = null;

    /** @type {string|null} URL текущего изображения */
    this.currentImageUrl = null;

    /** @type {string|null} ID сообщения текущего раунда */
    this.roundMessageId = null;

    /** @type {Set<string>} Угаданные уровни в текущем раунде */
    this.guessedLevels = new Set();

    /** @type {NodeJS.Timeout|null} Таймер раунда */
    this.roundTimer = null;

    /** @type {NodeJS.Timeout|null} Таймер перехода к следующему раунду */
    this.nextRoundTimer = null;

    /** @type {boolean} Флаг загрузки раунда (защита от дублирования) */
    this.isLoadingRound = false;

    /** @type {boolean} Скоро ли завершится раунд (был ли угадан exact) */
    this.isRoundEndingSoon = false;

    /** @type {boolean} Был ли первый правильный ответ в текущем раунде */
    this.firstGuessGiven = false;

    /**
     * Локации, отфильтрованные по сложности.
     * Если у локаций нет поля difficulty — используем все.
     * @type {Object[]}
     */
    this.allLocations = locations.filter(
      (loc) => !loc.difficulty || loc.difficulty === difficulty
    );

    // Если после фильтрации ничего не осталось — берём все
    if (this.allLocations.length === 0) {
      this.allLocations = [...locations];
    }
  }

  /**
   * Перемешивает массив in-place (алгоритм Фишера-Йейтса).
   *
   * @param {any[]} arr - Массив для перемешивания
   * @returns {any[]} Тот же массив, но перемешанный
   */
  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Выбирает следующую неиспользованную локацию.
   * Если все локации были использованы — сбрасывает и перемешивает.
   *
   * @returns {Object} Выбранная локация
   */
  pickNextLocation() {
    const available = this.allLocations.filter(
      (loc) => !this.usedLocationIds.has(loc.id)
    );

    if (available.length === 0) {
      // Все локации использованы — сбрасываем
      this.usedLocationIds.clear();
      this.shuffleArray(this.allLocations);
      return this.allLocations[0];
    }

    // Выбираем случайную из доступных
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }

  /**
   * Запускает следующий раунд.
   * Выбирает локацию, загружает изображение, отправляет embed в канал.
   *
   * @param {import('discord.js').TextChannel} channel - Discord канал
   * @returns {Promise<void>}
   */
  async startNextRound(channel) {
    if (!this.isActive || this.isLoadingRound) return;

    this.isLoadingRound = true;

    try {
      this.round++;
      this.guessedLevels.clear();
      this.firstGuessGiven = false;
      this.isRoundEndingSoon = false;
      this._endingReason = null;
      this.currentLocation = null;
      this.currentImageUrl = null;
      this.roundMessageId = null;

      // Очищаем предыдущие таймеры
      this._clearTimers();

      // Ищем локацию с доступным изображением
      let location = null;
      let imageData = null;
      let retries = 0;

      while (retries < MAX_IMAGE_RETRIES) {
        const candidate = this.pickNextLocation();
        this.usedLocationIds.add(candidate.id);

        try {
          imageData = await fetchImageForLocation(candidate);
        } catch (err) {
          console.error(`[GameSession] Ошибка загрузки изображения для "${candidate.landmark}":`, err.message);
          imageData = null;
        }

        if (imageData && imageData.url) {
          location = candidate;
          break;
        }

        retries++;
        console.warn(`[GameSession] Изображение не найдено для "${candidate.landmark}", попытка ${retries}/${MAX_IMAGE_RETRIES}`);
      }

      if (!location || !imageData) {
        await channel.send('⚠️ Не удалось найти локацию с изображением. Попробуйте начать новую игру.');
        this.isLoadingRound = false;
        this.isActive = false;
        return;
      }

      this.currentLocation = location;
      this.currentImageUrl = imageData.url;

      // Формируем подсказку для лёгкого режима
      const hint = this.difficulty === 'easy' && (location.hintRu || location.hint)
        ? (location.hintRu || location.hint)
        : null;

      // Отправляем embed раунда
      const attachment = new AttachmentBuilder(this.currentImageUrl, { name: 'guess.jpg' });
      const embed = roundEmbed(this.round, 'attachment://guess.jpg', this.difficulty, hint);
      const roundMessage = await channel.send({ embeds: [embed], files: [attachment] });
      this.roundMessageId = roundMessage.id;

      // Таймер 90 секунд удален по просьбе пользователя. Раунд длится бесконечно,
      // пока не угадают точное место (тогда запускается 10 сек) или не пропустят раунд.
    } catch (err) {
      console.error('[GameSession] Критическая ошибка в startNextRound:', err);
      try {
        await channel.send('⚠️ Произошла ошибка при загрузке раунда. Попробуйте `!stop` и начните заново.');
      } catch { /* ignore send errors */ }
    } finally {
      this.isLoadingRound = false;
    }
  }

  /**
   * Обрабатывает сообщение-ответ игрока.
   *
   * @param {import('discord.js').Message} message - Сообщение Discord
   * @param {string|null} overrideText - Текст ответа, если это упоминание
   * @returns {Promise<void>}
   */
  async handleGuess(message, overrideText = null) {
    // Проверяем состояние
    if (!this.isActive || this.isLoadingRound || !this.currentLocation) {
      return;
    }

    const userAnswer = overrideText !== null ? overrideText : message.content;
    const result = checkAnswer(userAnswer, this.currentLocation);

    if (!result.levels || result.levels.length === 0) {
      // Неправильный ответ — реакция ❌
      try {
        await message.react('❌');
      } catch { /* ignore react errors */ }
      return;
    }

    const orderedLevels = ['exact', 'city', 'country'];
    let totalPoints = 0;
    let totalBase = 0;
    let totalBonus = 0;
    let bestLevel = null;
    let anyAlreadyGuessed = false;

    for (const lvl of orderedLevels) {
      if (result.levels.includes(lvl)) {
        if (this.guessedLevels.has(lvl)) {
          anyAlreadyGuessed = true;
          continue;
        }
        
        // Рассчитываем очки
        const isFirst = !this.firstGuessGiven;
        const scoreResult = calculateScore({
          level: lvl,
          difficulty: this.difficulty,
          isFirst,
        });

        totalPoints += scoreResult.total;
        totalBase += scoreResult.base;
        totalBonus += scoreResult.bonus;
        if (!bestLevel) bestLevel = lvl;

        this.guessedLevels.add(lvl);
        this._updatePlayerScore(message.author, scoreResult.total, lvl);

        if (isFirst) {
          this.firstGuessGiven = true;
        }
      }
    }

    if (totalPoints > 0) {
      // Реакция ✅
      try {
        await message.react('✅');
      } catch { /* ignore */ }

      // Отправляем embed правильного ответа
      try {
        let contentText = null;
        let shouldEndImmediately = false;
        
        // Проверяем, угадано ли точное место
        if (this.guessedLevels.has('exact') && (!this.isRoundEndingSoon || this._endingReason !== 'exact')) {
          this.isRoundEndingSoon = true;
          this._endingReason = 'exact';

          if (this.roundTimer) clearTimeout(this.roundTimer);
          shouldEndImmediately = true;
        } 
        // Если угаданы город и страна, даем 30 секунд на точное место
        else if (this.guessedLevels.has('city') && this.guessedLevels.has('country') && !this.guessedLevels.has('exact') && !this.isRoundEndingSoon) {
          this.isRoundEndingSoon = true;
          this._endingReason = 'city_country';
          contentText = '⏳ **Город и страна угаданы!** На отгадывание точного места осталось 30 секунд.';

          if (this.roundTimer) clearTimeout(this.roundTimer);
          this.roundTimer = setTimeout(async () => {
            if (!this.isActive) return;
            await this._endRound(message.channel);
          }, 30_000);
        }

        const embed = correctGuessEmbed(
          message.author,
          this.currentLocation,
          bestLevel,
          totalBase,
          totalBonus,
          this.guessedLevels
        );

        if (contentText) {
          await message.channel.send({ content: contentText, embeds: [embed] });
        } else {
          await message.channel.send({ embeds: [embed] });
        }

        if (shouldEndImmediately) {
          await this._endRound(message.channel);
        }
      } catch (err) {
        console.error('[GameSession] Ошибка отправки correctGuessEmbed:', err);
      }
    } else if (anyAlreadyGuessed) {
      // Если все предложенные правильные уровни уже были угаданы
      try {
        // Берем самый точный уровень из предложенных
        const embed = alreadyGuessedEmbed(result.levels[0]);
        const replyMsg = await message.reply({ embeds: [embed] });
        setTimeout(() => replyMsg.delete().catch(() => {}), 5000);
      } catch { /* ignore */ }
      return;
    }


  }

  /**
   * Завершает текущий раунд: показывает таблицу, запускает следующий.
   *
   * @param {import('discord.js').TextChannel} channel
   * @returns {Promise<void>}
   * @private
   */
  async _endRound(channel) {
    // Очищаем таймер раунда
    this._clearTimers();

    try {
      // Показываем единый embed завершения раунда (ответ + таблица + таймер)
      const exactGuessed = this.guessedLevels.has('exact');
      const sb = this.getScoreboard();
      const rEmbed = roundEndEmbed(
        this.currentLocation, 
        exactGuessed, 
        sb, 
        this.round, 
        NEXT_ROUND_DELAY_MS / 1000
      );
      
      await channel.send({ embeds: [rEmbed] });

      // Запуск следующего раунда через задержку
      this.nextRoundTimer = setTimeout(() => {
        this.startNextRound(channel).catch((err) => {
          console.error('[GameSession] Ошибка запуска следующего раунда:', err);
        });
      }, NEXT_ROUND_DELAY_MS);
    } catch (err) {
      console.error('[GameSession] Ошибка при завершении раунда:', err);
    }
  }

  /**
   * Обновляет счёт игрока.
   *
   * @param {import('discord.js').User} user - Discord пользователь
   * @param {number} points - Очки для начисления
   * @param {"exact"|"city"|"country"} level - Уровень ответа
   * @private
   */
  _updatePlayerScore(user, points, level) {
    const userId = user.id;

    if (!this.scores.has(userId)) {
      this.scores.set(userId, {
        username: user.displayName || user.username,
        points: 0,
        correctGuesses: 0,
        exactGuesses: 0,
      });
    }

    const playerData = this.scores.get(userId);
    playerData.points += points;
    playerData.correctGuesses++;

    if (level === 'exact') {
      playerData.exactGuesses++;
    }

    // Обновляем имя на случай, если оно изменилось
    playerData.username = user.displayName || user.username;
  }

  /**
   * Возвращает отсортированную таблицу лидеров.
   *
   * @returns {Array<{ userId: string, username: string, points: number, correctGuesses: number, exactGuesses: number }>}
   */
  getScoreboard() {
    const entries = [];

    for (const [userId, data] of this.scores) {
      entries.push({ userId, ...data });
    }

    // Сортировка: по очкам убывающая, при равенстве — по точным ответам
    entries.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.exactGuesses !== a.exactGuesses) return b.exactGuesses - a.exactGuesses;
      return b.correctGuesses - a.correctGuesses;
    });

    return entries;
  }

  /**
   * Повторно отправляет текущий раунд (если кто-то запросил).
   * @param {import('discord.js').TextChannel} channel
   */
  async resendCurrentRound(channel) {
    if (!this.isActive || !this.currentLocation || !this.currentImageUrl) return;

    try {
      const { roundEmbed } = require('../utils/embeds');
      const hint = this.difficulty === 'easy' && (this.currentLocation.hintRu || this.currentLocation.hint)
        ? (this.currentLocation.hintRu || this.currentLocation.hint)
        : null;

      const attachment = new AttachmentBuilder(this.currentImageUrl, { name: 'guess.jpg' });
      const embed = roundEmbed(this.round, 'attachment://guess.jpg', this.difficulty, hint);
      await channel.send({ embeds: [embed], files: [attachment] });
    } catch (err) {
      console.error('[GameSession] Ошибка переотправки раунда:', err);
    }
  }

  /**
   * Пропускает текущий раунд (без начисления очков) и переходит к следующему.
   * @param {import('discord.js').TextChannel} channel - Канал для отправки сообщений
   */
  async skipAndNextRound(channel) {
    this._clearTimers();
    
    if (!this.currentLocation) return;
    
    try {
      const { skipEmbed, nextRoundEmbed } = require('../utils/embeds');
      
      const sEmbed = skipEmbed(this.currentLocation);
      await channel.send({ embeds: [sEmbed] });

      const nrEmbed = nextRoundEmbed(NEXT_ROUND_DELAY_MS / 1000);
      await channel.send({ embeds: [nrEmbed] });

      this.currentLocation = null;
      this.currentImageUrl = null;
      this.roundMessageId = null;
      this.guessedLevels.clear();
      this.firstGuessGiven = false;
      this.isRoundEndingSoon = false;
      this._endingReason = null;

      this.nextRoundTimer = setTimeout(() => {
        this.startNextRound(channel).catch((err) => {
          console.error('[GameSession] Ошибка запуска следующего раунда:', err);
        });
      }, NEXT_ROUND_DELAY_MS);
    } catch (err) {
      console.error('[GameSession] Ошибка при пропуске раунда:', err);
    }
  }

  /**
   * Останавливает игровую сессию.
   * Очищает все таймеры, возвращает финальные результаты.
   *
   * @returns {Array<{ userId: string, username: string, points: number, correctGuesses: number, exactGuesses: number }>}
   */
  stop() {
    this.isActive = false;
    this._clearTimers();
    return this.getScoreboard();
  }

  /**
   * Очищает все активные таймеры.
   * @private
   */
  _clearTimers() {
    if (this.roundTimer) {
      clearTimeout(this.roundTimer);
      this.roundTimer = null;
    }
    if (this.nextRoundTimer) {
      clearTimeout(this.nextRoundTimer);
      this.nextRoundTimer = null;
    }
  }
}

module.exports = GameSession;

/**
 * @module utils/embeds
 * @description Генераторы красивых Discord embed-сообщений для GeoGuesser бота.
 * Все embed'ы имеют единый стиль: футер, таймстамп, эмодзи-оформление.
 */

'use strict';

const { EmbedBuilder } = require('discord.js');

/** Стандартный футер для всех embed'ов */
const FOOTER_TEXT = 'GeoGuesser Bot 🌍';

/** Названия сложностей для отображения */
const DIFFICULTY_LABELS = {
  easy: '🟢 Лёгкая',
  medium: '🟡 Средняя',
  hard: '🔴 Сложная',
};

/** Названия уровней ответов для отображения */
const LEVEL_LABELS = {
  exact: '🎯 Точное место',
  city: '🏙️ Город',
  country: '🌍 Страна',
};

/** Цвета для уровней ответов */
const LEVEL_COLORS = {
  exact: 0xffd700,
  city: 0xff9900,
  country: 0xff6600,
};

/**
 * Создаёт базовый embed с футером и таймстампом.
 * @returns {EmbedBuilder}
 */
function baseEmbed() {
  return new EmbedBuilder()
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}

/**
 * Embed начала игры.
 *
 * @param {string} difficulty - Сложность игры
 * @param {string} playerName - Имя игрока, запустившего игру
 * @returns {EmbedBuilder}
 */
function gameStartEmbed(difficulty, playerName) {
  const diffLabel = DIFFICULTY_LABELS[difficulty] || difficulty;

  return baseEmbed()
    .setColor(0x00ff00)
    .setTitle('🎮 Игра началась!')
    .setDescription(
      `Сложность: **${diffLabel}**\n\n` +
      `**Как играть:**\n` +
      `1. Я буду присылать фото места\n` +
      `2. Отвечайте **реплаем** на фото или **пингните меня** (например: \`@GeoGuesser ответ\`)\n` +
      `3. Можно перечислять через запятую (город, страна, место) для комбо-очков!\n` +
      `4. Время раунда **не ограничено**. Раунд сменится, когда угадают точное место (или при вводе \`@Бот скип\`).\n\n` +
      `Удачи, ${playerName}! 🌍`
    )
    .addFields(
      { name: '🎯 Точное место', value: 'Максимум очков', inline: true },
      { name: '🏙️ Город', value: 'Средние очки', inline: true },
      { name: '🌍 Страна', value: 'Минимум очков', inline: true }
    );
}

/**
 * Embed раунда с фотографией.
 *
 * @param {number} roundNumber - Номер раунда
 * @param {string} imageUrl - URL изображения
 * @param {string} difficulty - Сложность
 * @param {string|null} [hint=null] - Подсказка (отображается на лёгкой сложности)
 * @returns {EmbedBuilder}
 */
function roundEmbed(roundNumber, imageUrl, difficulty, hint = null) {
  const diffLabel = DIFFICULTY_LABELS[difficulty] || difficulty;

  const embed = baseEmbed()
    .setColor(0x0099ff)
    .setTitle(`📍 Раунд ${roundNumber}`)
    .setDescription(
      `${diffLabel}\n\n` +
      `🔍 **Что это за место?**\n` +
      `Ответьте **реплаем** или напишите **@Бот ваш ответ**!`
    )
    .setImage(imageUrl);

  if (hint && difficulty === 'easy') {
    embed.setFooter({ text: `💡 Подсказка: ${hint} • ${FOOTER_TEXT}` });
  }

  return embed;
}

/**
 * Embed правильного ответа.
 *
 * @param {Object} user - Discord user объект
 * @param {Object} location - Объект локации
 * @param {"exact"|"city"|"country"} level - Уровень ответа
 * @param {number} points - Базовые очки
 * @param {number} bonusPoints - Бонусные очки за первый ответ
 * @param {Set<string>} guessedLevels - Множество угаданных уровней в раунде
 * @returns {EmbedBuilder}
 */
function correctGuessEmbed(user, location, level, points, bonusPoints, guessedLevels) {
  const levelLabel = LEVEL_LABELS[level] || level;
  const color = LEVEL_COLORS[level] || 0x00ff88;
  const totalPoints = points + bonusPoints;

  const bonusText = bonusPoints > 0
    ? `\n🌟 **Бонус за первый ответ:** +${bonusPoints}`
    : '';

  const countryName = location.countryRu || location.country;
  const cityName = location.cityRu || location.city;
  const landmarkName = location.landmarkRu || location.landmark;

  const showLandmark = guessedLevels.has('exact') ? landmarkName : '???';
  const showCity = guessedLevels.has('city') ? cityName : '???';
  const showCountry = guessedLevels.has('country') ? countryName : '???';

  const locationText = `📍 **${showLandmark}**\n🏙️ ${showCity}, ${showCountry}`;

  const embed = baseEmbed()
    .setColor(color)
    .setTitle(`✅ ${user.displayName || user.username} угадал(а)!`)
    .setDescription(
      `${levelLabel}\n\n` +
      `${locationText}\n\n` +
      `💰 **+${totalPoints} очков** (${points} базовых)${bonusText}`
    );

  const funFact = location.funFactRu || location.funFact;
  if (level === 'exact' && funFact) {
    embed.addFields({
      name: '💡 Интересный факт',
      value: funFact,
      inline: false,
    });
  }

  return embed;
}

/**
 * Embed неправильного ответа (минималистичный, чтобы не засорять чат).
 *
 * @returns {EmbedBuilder}
 */
function wrongGuessEmbed() {
  return baseEmbed()
    .setColor(0xff4444)
    .setDescription('❌ Неправильно! Попробуйте ещё раз.');
}

/**
 * Embed завершения раунда (объединяет ответ, таблицу лидеров и таймер).
 *
 * @param {Object} location - Объект локации
 * @param {boolean} exactGuessed - Угадал ли кто-то точное место
 * @param {Array} scoreboard - Таблица лидеров
 * @param {number} roundNumber - Текущий раунд
 * @param {number} delaySeconds - Секунды до следующего раунда
 * @returns {EmbedBuilder}
 */
function roundEndEmbed(location, exactGuessed, scoreboard, roundNumber, delaySeconds) {
  const answerLine = `📍 **${location.landmarkRu || location.landmark}** (${location.cityRu || location.city}, ${location.countryRu || location.country})`;
  
  let sbText = '';
  if (scoreboard && scoreboard.length > 0) {
    const top = scoreboard.slice(0, 3).map((e, i) => `${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} **${e.username}**: ${e.points}`).join(' | ');
    sbText = `\n🏆 **Топ:** ${top}`;
  }

  const funFact = location.funFactRu || location.funFact;
  const factText = funFact ? `\n💡 *${funFact}*` : '';

  return baseEmbed()
    .setColor(exactGuessed ? 0x00ff88 : 0x666666)
    .setDescription(
      `🏁 **Раунд завершён!** ${exactGuessed ? 'Место угадано!' : 'Никто не угадал место.'}\n` +
      `${answerLine}${factText}${sbText}\n` +
      `⏳ *Следующий раунд через ${delaySeconds} сек...*`
    );
}

/**
 * Embed текущей таблицы лидеров.
 *
 * @param {Array<{ username: string, points: number, correctGuesses: number, exactGuesses: number }>} scores
 * @param {number} roundNumber - Текущий номер раунда
 * @returns {EmbedBuilder}
 */
function scoreboardEmbed(scores, roundNumber) {
  const medals = ['🥇', '🥈', '🥉'];

  let leaderboard = '';
  if (scores.length === 0) {
    leaderboard = '_Пока никто не набрал очков_';
  } else {
    leaderboard = scores
      .map((entry, index) => {
        const medal = medals[index] || `**${index + 1}.**`;
        return `${medal} **${entry.username}** — ${entry.points} очков ` +
          `(${entry.correctGuesses} ✅ | ${entry.exactGuesses} 🎯)`;
      })
      .join('\n');
  }

  return baseEmbed()
    .setColor(0x9b59b6)
    .setTitle(`📊 Таблица лидеров — Раунд ${roundNumber}`)
    .setDescription(leaderboard);
}

/**
 * Embed финальных результатов игры.
 *
 * @param {Array<{ username: string, points: number, correctGuesses: number, exactGuesses: number }>} scores
 * @param {number} totalRounds - Общее количество сыгранных раундов
 * @returns {EmbedBuilder}
 */
function gameOverEmbed(scores, totalRounds) {
  const medals = ['🥇', '🥈', '🥉'];

  let results = '';
  if (scores.length === 0) {
    results = '_Никто не набрал очков за игру_';
  } else {
    results = scores
      .map((entry, index) => {
        const medal = medals[index] || `**${index + 1}.**`;
        const trophy = index === 0 ? ' 👑' : '';
        return `${medal} **${entry.username}**${trophy} — **${entry.points}** очков ` +
          `(${entry.correctGuesses} правильных | ${entry.exactGuesses} точных)`;
      })
      .join('\n');
  }

  const embed = baseEmbed()
    .setColor(0xe74c3c)
    .setTitle('🏆 Игра окончена!')
    .setDescription(
      `Сыграно раундов: **${totalRounds}**\n\n` +
      `${results}`
    );

  if (scores.length > 0) {
    embed.addFields({
      name: '🎉 Поздравляем победителя!',
      value: `**${scores[0].username}** занимает первое место с **${scores[0].points}** очками!`,
      inline: false,
    });
  }

  return embed;
}

/**
 * Embed пропуска раунда.
 *
 * @param {Object} location - Объект локации
 * @returns {EmbedBuilder}
 */
function skipEmbed(location) {
  return baseEmbed()
    .setColor(0x666666)
    .setTitle('⏭️ Раунд пропущен')
    .setDescription(
      `📍 **Ответ был:** ${location.landmarkRu || location.landmark}\n` +
      `🏙️ ${location.cityRu || location.city}, ${location.countryRu || location.country}`
    );
}

/**
 * Embed анонса следующего раунда.
 *
 * @param {number} secondsLeft - Секунды до следующего раунда
 * @returns {EmbedBuilder}
 */
function nextRoundEmbed(secondsLeft) {
  return baseEmbed()
    .setColor(0x1a1a2e)
    .setDescription(`⏳ Следующий раунд через **${secondsLeft}** сек...`);
}

/**
 * Embed уведомления, что данный уровень уже угадан.
 *
 * @param {"exact"|"city"|"country"} level - Уровень, который уже угадан
 * @returns {EmbedBuilder}
 */
function alreadyGuessedEmbed(level) {
  const levelLabel = LEVEL_LABELS[level] || level;

  return baseEmbed()
    .setColor(0x999999)
    .setDescription(`🔒 ${levelLabel} уже угадан(о) в этом раунде! Попробуйте более точный ответ.`);
}

/**
 * Embed ошибки.
 *
 * @param {string} text - Текст ошибки
 * @returns {EmbedBuilder}
 */
function errorEmbed(text) {
  return baseEmbed()
    .setColor(0xff4444)
    .setDescription(`❌ ${text}`);
}

/**
 * Embed информационного сообщения.
 *
 * @param {string} text - Текст сообщения
 * @returns {EmbedBuilder}
 */
function infoEmbed(text) {
  return baseEmbed()
    .setColor(0x3498db)
    .setDescription(`ℹ️ ${text}`);
}

module.exports = {
  gameStartEmbed,
  roundEmbed,
  correctGuessEmbed,
  wrongGuessEmbed,
  roundEndEmbed,
  scoreboardEmbed,
  gameOverEmbed,
  skipEmbed,
  nextRoundEmbed,
  alreadyGuessedEmbed,
  errorEmbed,
  infoEmbed,
};

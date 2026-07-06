/**
 * @module game/GameManager
 * @description Синглтон-менеджер всех активных игровых сессий.
 * Управляет созданием, получением и остановкой сессий по каналам.
 */

'use strict';

const GameSession = require('./GameSession');

class GameManager {
  constructor() {
    /**
     * Карта активных сессий: channelId → GameSession
     * @type {Map<string, GameSession>}
     */
    this.sessions = new Map();
  }

  /**
   * Запускает новую игру в указанном канале.
   *
   * @param {string} channelId - ID Discord канала
   * @param {"easy"|"medium"|"hard"} difficulty - Сложность игры
   * @param {string} startedBy - ID пользователя, запустившего игру
   * @returns {GameSession} Созданная игровая сессия
   * @throws {Error} Если в канале уже идёт активная игра
   */
  startGame(channelId, difficulty, startedBy) {
    if (this.sessions.has(channelId)) {
      throw new Error(`В этом канале уже идёт активная игра! Используйте команду остановки, чтобы завершить текущую.`);
    }

    const session = new GameSession(channelId, difficulty, startedBy);
    this.sessions.set(channelId, session);

    console.log(`[GameManager] Новая игра в канале ${channelId} | Сложность: ${difficulty} | Запустил: ${startedBy}`);

    return session;
  }

  /**
   * Останавливает игру в указанном канале.
   *
   * @param {string} channelId - ID Discord канала
   * @returns {Array<{ userId: string, username: string, points: number, correctGuesses: number, exactGuesses: number }>} Финальные результаты
   * @throws {Error} Если в канале нет активной игры
   */
  stopGame(channelId) {
    const session = this.sessions.get(channelId);

    if (!session) {
      throw new Error(`В этом канале нет активной игры.`);
    }

    const finalScores = session.stop();
    this.sessions.delete(channelId);

    console.log(`[GameManager] Игра остановлена в канале ${channelId} | Раундов сыграно: ${session.round}`);

    return finalScores;
  }

  /**
   * Возвращает активную сессию для канала или null.
   *
   * @param {string} channelId - ID Discord канала
   * @returns {GameSession|null}
   */
  getSession(channelId) {
    return this.sessions.get(channelId) || null;
  }

  /**
   * Проверяет, есть ли активная игра в канале.
   *
   * @param {string} channelId - ID Discord канала
   * @returns {boolean}
   */
  hasActiveGame(channelId) {
    return this.sessions.has(channelId);
  }

  /**
   * Возвращает все активные сессии.
   *
   * @returns {Map<string, GameSession>}
   */
  getAllSessions() {
    return this.sessions;
  }
}

// Экспортируем синглтон
module.exports = new GameManager();

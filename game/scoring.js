/**
 * @module game/scoring
 * @description Система подсчёта очков для GeoGuesser бота.
 * Очки зависят от уровня ответа, сложности и бонуса за первый правильный ответ.
 */

'use strict';

/**
 * Таблица базовых очков: [уровень ответа][сложность]
 * @type {Object.<string, Object.<string, number>>}
 */
const SCORE_TABLE = {
  exact: { easy: 100, medium: 150, hard: 200 },
  city:  { easy: 50,  medium: 75,  hard: 100 },
  country: { easy: 20, medium: 30, hard: 40 },
};

/** Бонус за первый правильный ответ в раунде (25%) */
const FIRST_BONUS_MULTIPLIER = 0.25;

/**
 * Рассчитывает количество очков за ответ.
 *
 * @param {Object} params - Параметры расчёта
 * @param {"exact"|"city"|"country"} params.level - Уровень точности ответа
 * @param {"easy"|"medium"|"hard"} params.difficulty - Сложность игры
 * @param {boolean} [params.isFirst=false] - Является ли это первым правильным ответом в раунде
 * @returns {{ base: number, bonus: number, total: number }} Объект с базовыми очками, бонусом и итогом
 * @throws {Error} Если передан неизвестный уровень или сложность
 */
function calculateScore({ level, difficulty, isFirst = false }) {
  if (!SCORE_TABLE[level]) {
    throw new Error(`Неизвестный уровень ответа: "${level}". Допустимые: exact, city, country`);
  }

  const levelScores = SCORE_TABLE[level];
  if (levelScores[difficulty] === undefined) {
    throw new Error(`Неизвестная сложность: "${difficulty}". Допустимые: easy, medium, hard`);
  }

  const base = levelScores[difficulty];
  const bonus = isFirst ? Math.round(base * FIRST_BONUS_MULTIPLIER) : 0;
  const total = base + bonus;

  return { base, bonus, total };
}

module.exports = { calculateScore, SCORE_TABLE, FIRST_BONUS_MULTIPLIER };

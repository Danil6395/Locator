/**
 * @module utils/answerChecker
 * @description Умная проверка ответов с нормализацией и нечётким сопоставлением.
 * Поддерживает русский и английский языки, алиасы, пороговое совпадение.
 */

'use strict';

const stringSimilarity = require('string-similarity');

/** Порог нечёткого совпадения (0–1). Значения >= порога считаются совпадением. */
const SIMILARITY_THRESHOLD = 0.78;

/**
 * Нормализует строку для сравнения:
 * - приводит к нижнему регистру
 * - удаляет знаки пунктуации
 * - схлопывает множественные пробелы
 * - убирает начальные/конечные пробелы
 *
 * @param {string} str - Исходная строка
 * @returns {string} Нормализованная строка
 */
function normalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '') // удаляем всё кроме букв, цифр, пробелов (Unicode)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Проверяет, совпадает ли нормализованный ответ пользователя
 * с одним из допустимых вариантов (точно или нечётко).
 *
 * @param {string} normalizedAnswer - Нормализованный ответ пользователя
 * @param {string[]} candidates - Список допустимых вариантов (ненормализованных)
 * @returns {boolean} true, если ответ совпадает хотя бы с одним вариантом
 */
function matchesAny(normalizedAnswer, candidates) {
  if (!normalizedAnswer || candidates.length === 0) return false;

  for (const candidate of candidates) {
    const normalizedCandidate = normalize(candidate);
    if (!normalizedCandidate) continue;

    // Точное совпадение после нормализации
    if (normalizedAnswer === normalizedCandidate) return true;

    // Нечёткое совпадение
    const similarity = stringSimilarity.compareTwoStrings(normalizedAnswer, normalizedCandidate);
    if (similarity >= SIMILARITY_THRESHOLD) return true;
  }

  return false;
}

/**
 * Собирает непустые строки из указанных полей локации в массив.
 *
 * @param {Object} location - Объект локации
 * @param {string[]} fields - Имена полей для извлечения
 * @returns {string[]} Массив непустых строковых значений
 */
function collectCandidates(location, fields) {
  const candidates = [];
  for (const field of fields) {
    const value = location[field];
    if (typeof value === 'string' && value.trim()) {
      candidates.push(value);
    } else if (Array.isArray(value)) {
      // Для поля aliases — массив строк
      for (const item of value) {
        if (typeof item === 'string' && item.trim()) {
          candidates.push(item);
        }
      }
    }
  }
  return candidates;
}

/**
 * Проверяет ответ пользователя относительно данных локации.
 * Проверка идёт от самого точного уровня к наименее точному:
 * exact (достопримечательность) → city (город) → country (страна).
 *
 * @param {string} userAnswer - Ответ пользователя
 * @param {Object} location - Объект локации из базы данных
 * @param {string} location.landmark - Название достопримечательности (EN)
 * @param {string} [location.landmarkRu] - Название достопримечательности (RU)
 * @param {string} location.city - Город (EN)
 * @param {string} [location.cityRu] - Город (RU)
 * @param {string} location.country - Страна (EN)
 * @param {string} [location.countryRu] - Страна (RU)
 * @param {string[]} [location.aliases] - Альтернативные названия
 * @returns {{ level: "exact"|"city"|"country"|null }} Результат проверки
 */
function checkAnswer(userAnswer, location) {
  if (!userAnswer || typeof userAnswer !== 'string' || !location) {
    return { levels: [] };
  }

  // Разбиваем по запятым, 'и', 'and', '+'
  const parts = userAnswer.split(/,|\bи\b|\band\b|\+/i).map(p => p.trim()).filter(Boolean);
  
  if (parts.length === 0) {
    return { levels: [] };
  }

  const matchedLevels = new Set();

  const exactCandidates = collectCandidates(location, ['landmark', 'landmarkRu', 'aliases']);
  const cityCandidates = collectCandidates(location, ['city', 'cityRu']);
  const countryCandidates = collectCandidates(location, ['country', 'countryRu']);

  for (const part of parts) {
    const normalizedPart = normalize(part);
    if (!normalizedPart) continue;

    if (matchesAny(normalizedPart, exactCandidates)) {
      matchedLevels.add('exact');
    }
    if (matchesAny(normalizedPart, cityCandidates)) {
      matchedLevels.add('city');
    }
    if (matchesAny(normalizedPart, countryCandidates)) {
      matchedLevels.add('country');
    }
  }

  return { levels: Array.from(matchedLevels) };
}

module.exports = { checkAnswer, normalize, SIMILARITY_THRESHOLD };

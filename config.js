/**
 * ⚙️ Конфигурация GeoGuesser Bot
 */

module.exports = {
  // === Система баллов ===
  scoring: {
    // Баллы за точное место (landmark)
    exact: { easy: 100, medium: 150, hard: 200 },
    // Баллы за город
    city: { easy: 50, medium: 75, hard: 100 },
    // Баллы за страну
    country: { easy: 20, medium: 30, hard: 40 },
    // Бонус первому угадавшему (+25%)
    firstBonus: 0.25,
  },

  // === Таймеры ===
  timers: {
    // Время на раунд (в миллисекундах) — 90 секунд
    roundTimeout: 90_000,
    // Пауза между раундами (в миллисекундах) — 5 секунд
    betweenRounds: 5_000,
  },

  // === Wikimedia API ===
  wikimedia: {
    // Базовый URL API
    apiUrl: 'https://commons.wikimedia.org/w/api.php',
    // Радиус поиска фото (в метрах)
    searchRadius: 1000,
    // Максимум фото для выбора
    searchLimit: 10,
    // Ширина превью (px)
    thumbWidth: 800,
    // User-Agent (обязательно для Wikimedia API)
    userAgent: 'GeoGuesserDiscordBot/1.0 (https://github.com/geoguesser-bot)',
    // Максимум попыток найти фото для одной локации
    maxRetries: 5,
    // Минимальная ширина изображения (px) для фильтрации мелких иконок
    minImageWidth: 300,
  },

  // === Игровые настройки ===
  game: {
    // Максимум активных игр на одном сервере
    maxGamesPerGuild: 5,
  },

  // === Цвета для Embed ===
  colors: {
    start: 0x00ff88,      // Зелёный — старт игры
    round: 0x0099ff,      // Синий — новый раунд
    exactGuess: 0xffd700,  // Золотой — точный ответ
    cityGuess: 0xff9900,   // Оранжевый — город
    countryGuess: 0xff6600,// Тёмно-оранжевый — страна
    wrong: 0xff4444,       // Красный — неверно
    timeout: 0x666666,     // Серый — таймаут
    scoreboard: 0x9b59b6,  // Фиолетовый — таблица
    gameOver: 0xe74c3c,    // Красный — конец игры
    nextRound: 0x2c3e50,   // Тёмно-синий — пауза
    skip: 0x95a5a6,        // Серый — пропуск
    alreadyGuessed: 0x7f8c8d, // Серый — уже угадано
    info: 0x3498db,        // Голубой — инфо
  },

  // === Эмодзи ===
  emojis: {
    easy: '🟢',
    medium: '🟡',
    hard: '🔴',
    correct: '✅',
    wrong: '❌',
    timeout: '⏰',
    trophy: '🏆',
    medal1: '🥇',
    medal2: '🥈',
    medal3: '🥉',
    globe: '🌍',
    camera: '📸',
    pin: '📍',
    star: '⭐',
    fire: '🔥',
    think: '🤔',
    skip: '⏭️',
    stop: '🛑',
    chart: '📊',
    clock: '⏳',
    sparkle: '✨',
    lightning: '⚡',
    tada: '🎉',
    target: '🎯',
    city: '🏙️',
    country: '🌍',
    hint: '💡',
  },

  // === Fuzzy matching ===
  matching: {
    // Порог сходства для fuzzy matching (0-1)
    threshold: 0.78,
  },
};

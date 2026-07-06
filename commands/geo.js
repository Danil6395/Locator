/**
 * 🎮 Slash-команды GeoGuesser Bot
 * /geo start [сложность] — начать игру
 * /geo stop — остановить игру
 * /geo score — текущий счёт
 * /geo skip — пропустить раунд
 */

const { SlashCommandBuilder } = require('discord.js');
const gameManager = require('../game/GameManager');
const {
  gameStartEmbed,
  scoreboardEmbed,
  gameOverEmbed,
  skipEmbed,
  errorEmbed,
  infoEmbed,
} = require('../utils/embeds');
const config = require('../config');

/**
 * Определение slash-команды /geo
 */
const data = new SlashCommandBuilder()
  .setName('geo')
  .setDescription('🌍 GeoGuesser — угадай местоположение по фото!')
  .addSubcommand(sub =>
    sub
      .setName('start')
      .setDescription('Начать новую игру')
      .addStringOption(opt =>
        opt
          .setName('difficulty')
          .setDescription('Уровень сложности')
          .setRequired(true)
          .addChoices(
            { name: '🟢 Лёгкий — подсказки + знаменитые места', value: 'easy' },
            { name: '🟡 Средний — без подсказок, известные места', value: 'medium' },
            { name: '🔴 Сложный — без подсказок, редкие места', value: 'hard' },
          ),
      ),
  )
  .addSubcommand(sub =>
    sub
      .setName('stop')
      .setDescription('Остановить текущую игру и показать итоги'),
  )
  .addSubcommand(sub =>
    sub
      .setName('score')
      .setDescription('Показать текущую таблицу лидеров'),
  )
  .addSubcommand(sub =>
    sub
      .setName('skip')
      .setDescription('Пропустить текущий раунд'),
  );

/**
 * Обработчик взаимодействий
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case 'start':
      await handleStart(interaction);
      break;
    case 'stop':
      await handleStop(interaction);
      break;
    case 'score':
      await handleScore(interaction);
      break;
    case 'skip':
      await handleSkip(interaction);
      break;
  }
}

/**
 * /geo start — начать игру
 */
async function handleStart(interaction) {
  const channelId = interaction.channelId;
  const difficulty = interaction.options.getString('difficulty');

  // Если в канале уже есть игра, останавливаем её автоматически
  if (gameManager.hasActiveGame(channelId)) {
    try {
      const oldSession = gameManager.getSession(channelId);
      if (oldSession) oldSession.stop();
      gameManager.stopGame(channelId);
    } catch (e) { /* ignore */ }
  }

  try {
    // Создаём новую игровую сессию
    const session = gameManager.startGame(channelId, difficulty, interaction.user.id);

    const diffEmoji = config.emojis[difficulty];
    const diffName = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' }[difficulty];

    // Отправляем стартовое сообщение
    await interaction.reply({
      embeds: [gameStartEmbed(difficulty, interaction.user.displayName || interaction.user.username)],
    });

    // Небольшая пауза перед первым раундом
    setTimeout(async () => {
      try {
        await session.startNextRound(interaction.channel);
      } catch (err) {
        console.error('[GEO] Ошибка запуска первого раунда:', err);
        gameManager.stopGame(channelId);
        await interaction.channel.send({
          embeds: [errorEmbed('Не удалось загрузить первый раунд. Попробуйте снова.')],
        });
      }
    }, 2000);

  } catch (error) {
    console.error('[GEO] Ошибка старта игры:', error);
    await interaction.reply({
      embeds: [errorEmbed('Не удалось начать игру. Попробуй ещё раз!')],
      ephemeral: true,
    });
  }
}

/**
 * /geo stop — остановить игру
 */
async function handleStop(interaction) {
  const channelId = interaction.channelId;

  if (!gameManager.hasActiveGame(channelId)) {
    await interaction.reply({
      embeds: [errorEmbed('В этом канале нет активной игры. Начни с `/geo start`!')],
      ephemeral: true,
    });
    return;
  }

  try {
    const session = gameManager.getSession(channelId);
    const totalRounds = session.round;
    const scores = session.getScoreboard();

    gameManager.stopGame(channelId);

    await interaction.reply({
      embeds: [gameOverEmbed(scores, totalRounds)],
    });
  } catch (error) {
    console.error('[GEO] Ошибка остановки игры:', error);
    // Принудительно удаляем сессию
    try { gameManager.stopGame(channelId); } catch (e) { /* ignore */ }
    await interaction.reply({
      embeds: [infoEmbed('Игра завершена.')],
    });
  }
}

/**
 * /geo score — текущий счёт
 */
async function handleScore(interaction) {
  const channelId = interaction.channelId;

  if (!gameManager.hasActiveGame(channelId)) {
    await interaction.reply({
      embeds: [errorEmbed('В этом канале нет активной игры. Начни с `/geo start`!')],
      ephemeral: true,
    });
    return;
  }

  const session = gameManager.getSession(channelId);
  const scores = session.getScoreboard();

  if (scores.length === 0) {
    await interaction.reply({
      embeds: [infoEmbed('Пока никто не набрал баллов! Угадай локацию первым! 🌍')],
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({
    embeds: [scoreboardEmbed(scores, session.round)],
  });
}

/**
 * /geo skip — пропустить раунд
 */
async function handleSkip(interaction) {
  const channelId = interaction.channelId;

  if (!gameManager.hasActiveGame(channelId)) {
    await interaction.reply({
      embeds: [errorEmbed('В этом канале нет активной игры.')],
      ephemeral: true,
    });
    return;
  }

  const session = gameManager.getSession(channelId);

  if (!session.currentLocation) {
    await interaction.reply({
      embeds: [errorEmbed('Сейчас нет активного раунда.')],
      ephemeral: true,
    });
    return;
  }

  if (session.isLoadingRound) {
    await interaction.reply({
      embeds: [infoEmbed('Подожди, загружается следующий раунд...')],
      ephemeral: true,
    });
    return;
  }

  // Пропускаем раунд
  await interaction.reply({ content: '⏭️ Пропускаем раунд...', ephemeral: true });
  await session.skipAndNextRound(interaction.channel);
}

module.exports = { data, execute };

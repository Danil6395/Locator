/**
 * 🌍 GeoGuesser Discord Bot — Точка входа
 * Угадай местоположение по фото!
 */

require('dotenv').config();

const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');
const geoCommand = require('./commands/geo');
const gameManager = require('./game/GameManager');
const config = require('./config');

// === Проверка переменных окружения ===
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN не указан в .env файле!');
  console.error('   Скопируй .env.example в .env и заполни данные.');
  process.exit(1);
}

// === Создание клиента ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// === Коллекция команд ===
client.commands = new Collection();
client.commands.set(geoCommand.data.name, geoCommand);

// === Событие: бот готов ===
client.once(Events.ClientReady, (readyClient) => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     🌍 GeoGuesser Bot запущен!           ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Бот: ${readyClient.user.tag.padEnd(33)}║`);
  console.log(`║  Серверов: ${String(readyClient.guilds.cache.size).padEnd(29)}║`);
  console.log('║                                          ║');
  console.log('║  Команды:                                ║');
  console.log('║   /geo start [сложность] — Начать игру   ║');
  console.log('║   /geo stop   — Остановить игру          ║');
  console.log('║   /geo score  — Таблица лидеров          ║');
  console.log('║   /geo skip   — Пропустить раунд         ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});

// === Событие: обработка slash-команд ===
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.warn(`[WARN] Неизвестная команда: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`[ERROR] Ошибка выполнения /${interaction.commandName}:`, error);

    const errorMsg = { content: '❌ Произошла ошибка при выполнении команды.', ephemeral: true };

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMsg);
      } else {
        await interaction.reply(errorMsg);
      }
    } catch (e) {
      // Ничего не делаем, если не удалось отправить ошибку
    }
  }
});

// === Событие: обработка ответов на раунды (reply) и упоминаний ===
client.on(Events.MessageCreate, async (message) => {
  // Игнорируем ботов
  if (message.author.bot) return;

  // Проверяем, есть ли активная игра в этом канале
  const session = gameManager.getSession(message.channelId);
  if (!session || !session.isActive) return;

  // Проверяем, что раунд активен и не загружается
  if (session.isLoadingRound || !session.currentLocation) return;

  let isReplyToRound = false;
  if (message.reference && message.reference.messageId === session.roundMessageId) {
    isReplyToRound = true;
  }

  let isMention = false;
  if (message.mentions.has(client.user)) {
    isMention = true;
  }

  if (!isReplyToRound && !isMention) return;

  let answerText = message.content;

  if (isMention) {
    // Убираем пинг из текста
    answerText = answerText.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();

    const lowerText = answerText.toLowerCase();
    
    // Если это команда пропуска
    if (['скип', 'skip', 'дальше', 'next'].includes(lowerText)) {
      await session.skipAndNextRound(message.channel);
      return;
    }

    // Если это команда переотправки раунда
    if (['раунд', 'round', 'инфо', 'info'].includes(lowerText)) {
      await session.resendCurrentRound(message.channel);
      return;
    }
  }

  if (!answerText) return;

  // Обрабатываем ответ
  try {
    await session.handleGuess(message, answerText);
  } catch (error) {
    console.error('[ERROR] Ошибка обработки ответа:', error);
  }
});

// === Graceful shutdown ===
function shutdown(signal) {
  console.log(`\n🛑 Получен сигнал ${signal}. Завершаем...`);

  // Останавливаем все активные игры
  const activeSessions = gameManager.getAllSessions();
  for (const [channelId, session] of activeSessions) {
    try {
      session.stop();
      console.log(`  ⏹ Игра в канале ${channelId} остановлена`);
    } catch (e) {
      // ignore
    }
  }

  client.destroy();
  console.log('👋 Бот выключен. До встречи!');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// === Обработка необработанных ошибок ===
process.on('unhandledRejection', (error) => {
  console.error('[FATAL] Необработанная ошибка:', error);
});

process.on('uncaughtException', (error) => {
  console.error('[FATAL] Необработанное исключение:', error);
  process.exit(1);
});

// === Запуск ===
client.login(process.env.DISCORD_TOKEN);

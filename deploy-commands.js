/**
 * 📋 Скрипт регистрации slash-команд на сервере Discord
 * Запускать отдельно: node deploy-commands.js
 */

require('dotenv').config();

const { REST, Routes } = require('discord.js');
const { data } = require('./commands/geo');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('❌ Ошибка: Укажи DISCORD_TOKEN и CLIENT_ID в файле .env');
  process.exit(1);
}

const commands = [data.toJSON()];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('🔄 Регистрация slash-команд...');

    if (guildId) {
      // Регистрация на конкретный сервер (мгновенно)
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log(`✅ Команды зарегистрированы на сервере ${guildId}`);
    } else {
      // Глобальная регистрация (может занять до 1 часа)
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands },
      );
      console.log('✅ Команды зарегистрированы глобально (обновление до 1 часа)');
    }

    console.log('');
    console.log('📝 Зарегистрированные команды:');
    console.log('  /geo start [сложность] — Начать игру');
    console.log('  /geo stop              — Остановить игру');
    console.log('  /geo score             — Таблица лидеров');
    console.log('  /geo skip              — Пропустить раунд');

  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    process.exit(1);
  }
})();

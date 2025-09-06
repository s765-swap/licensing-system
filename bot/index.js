const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// API configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

// Bot configuration
const BOT_CONFIG = {
  channelId: process.env.DISCORD_CHANNEL_ID,
  adminRoleIds: process.env.ADMIN_ROLE_IDS ? process.env.ADMIN_ROLE_IDS.split(',') : [],
  notificationSettings: {
    newLicense: true,
    licenseRevoked: true,
    licenseExpired: false,
    invalidAttempts: true,
    dailySummary: false,
    weeklyReport: false
  }
};

// API helper functions
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('API request error:', error.response?.data || error.message);
    throw error;
  }
};

// Discord embed helpers
const createEmbed = (title, description, color = 0x0099ff, fields = []) => {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp()
    .setFooter({ text: 'Licensing SaaS Bot' });

  fields.forEach(field => {
    embed.addFields(field);
  });

  return embed;
};

// Slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('license')
    .setDescription('License management commands')
    .addSubcommand(subcommand =>
      subcommand
        .setName('check')
        .setDescription('Validate a license key')
        .addStringOption(option =>
          option
            .setName('key')
            .setDescription('License key to validate')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('plugin')
            .setDescription('Plugin name')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('server')
            .setDescription('Server name')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Get detailed license information')
        .addStringOption(option =>
          option
            .setName('key')
            .setDescription('License key')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('revoke')
        .setDescription('Revoke a license (Admin only)')
        .addStringOption(option =>
          option
            .setName('key')
            .setDescription('License key to revoke')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stats')
        .setDescription('View license statistics')
    )
];

// Register slash commands
const registerCommands = async () => {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
    
    console.log('Started refreshing application (/) commands.');
    
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
};

// Command handlers
const handleLicenseCheck = async (interaction) => {
  const key = interaction.options.getString('key');
  const plugin = interaction.options.getString('plugin');
  const server = interaction.options.getString('server');

  try {
    await interaction.deferReply();

    const result = await apiRequest('/licenses/validate', 'POST', {
      key,
      plugin,
      server
    });

    if (result.success) {
      const embed = createEmbed(
        '✅ License Valid',
        `License key is valid and active`,
        0x00ff00,
        [
          { name: 'Plugin', value: result.data.plugin, inline: true },
          { name: 'Buyer', value: result.data.buyer, inline: true },
          { name: 'Server', value: result.data.server, inline: true },
          { name: 'Status', value: result.data.status, inline: true },
          { name: 'Expires', value: new Date(result.data.expiresAt).toLocaleDateString(), inline: true },
          { name: 'Last Validated', value: new Date(result.data.lastValidated).toLocaleString(), inline: true }
        ]
      );

      await interaction.editReply({ embeds: [embed] });
    } else {
      const embed = createEmbed(
        '❌ License Invalid',
        result.message,
        0xff0000
      );

      await interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    const embed = createEmbed(
      '❌ Error',
      'Failed to validate license. Please try again later.',
      0xff0000
    );

    await interaction.editReply({ embeds: [embed] });
  }
};

const handleLicenseInfo = async (interaction) => {
  const key = interaction.options.getString('key');

  try {
    await interaction.deferReply();

    // This would need to be implemented in the API to get license info by key
    // For now, we'll show a placeholder
    const embed = createEmbed(
      '📋 License Information',
      `License key: \`${key}\``,
      0x0099ff,
      [
        { name: 'Note', value: 'Detailed license info requires API endpoint implementation', inline: false }
      ]
    );

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    const embed = createEmbed(
      '❌ Error',
      'Failed to get license information.',
      0xff0000
    );

    await interaction.editReply({ embeds: [embed] });
  }
};

const handleLicenseRevoke = async (interaction) => {
  const key = interaction.options.getString('key');

  // Check if user has admin role
  const hasAdminRole = interaction.member.roles.cache.some(role => 
    BOT_CONFIG.adminRoleIds.includes(role.id)
  );

  if (!hasAdminRole) {
    const embed = createEmbed(
      '❌ Access Denied',
      'You do not have permission to revoke licenses.',
      0xff0000
    );

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  try {
    await interaction.deferReply();

    const result = await apiRequest('/licenses/revoke', 'POST', { key });

    if (result.success) {
      const embed = createEmbed(
        '🔒 License Revoked',
        `License key has been successfully revoked`,
        0xff6600,
        [
          { name: 'License Key', value: `\`${key}\``, inline: false },
          { name: 'Plugin', value: result.data.plugin, inline: true },
          { name: 'Buyer', value: result.data.buyer, inline: true },
          { name: 'Server', value: result.data.server, inline: true }
        ]
      );

      await interaction.editReply({ embeds: [embed] });

      // Send notification to configured channel
      if (BOT_CONFIG.channelId && BOT_CONFIG.notificationSettings.licenseRevoked) {
        const notificationEmbed = createEmbed(
          '🔒 License Revoked',
          `License has been revoked by ${interaction.user.tag}`,
          0xff6600,
          [
            { name: 'License Key', value: `\`${key}\``, inline: false },
            { name: 'Plugin', value: result.data.plugin, inline: true },
            { name: 'Revoked By', value: interaction.user.tag, inline: true }
          ]
        );

        const channel = client.channels.cache.get(BOT_CONFIG.channelId);
        if (channel) {
          await channel.send({ embeds: [notificationEmbed] });
        }
      }
    } else {
      const embed = createEmbed(
        '❌ Error',
        result.message,
        0xff0000
      );

      await interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    const embed = createEmbed(
      '❌ Error',
      'Failed to revoke license. Please try again later.',
      0xff0000
    );

    await interaction.editReply({ embeds: [embed] });
  }
};

const handleLicenseStats = async (interaction) => {
  try {
    await interaction.deferReply();

    // This would need to be implemented in the API to get stats
    // For now, we'll show a placeholder
    const embed = createEmbed(
      '📊 License Statistics',
      'License statistics for your account',
      0x0099ff,
      [
        { name: 'Total Licenses', value: 'N/A', inline: true },
        { name: 'Active Licenses', value: 'N/A', inline: true },
        { name: 'Expired Licenses', value: 'N/A', inline: true },
        { name: 'Revoked Licenses', value: 'N/A', inline: true }
      ]
    );

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    const embed = createEmbed(
      '❌ Error',
      'Failed to get license statistics.',
      0xff0000
    );

    await interaction.editReply({ embeds: [embed] });
  }
};

// Event handlers
client.once('ready', async () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}!`);
  console.log(`📊 Bot is in ${client.guilds.cache.size} guilds`);
  
  // Register slash commands
  await registerCommands();
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'license') {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'check':
        await handleLicenseCheck(interaction);
        break;
      case 'info':
        await handleLicenseInfo(interaction);
        break;
      case 'revoke':
        await handleLicenseRevoke(interaction);
        break;
      case 'stats':
        await handleLicenseStats(interaction);
        break;
      default:
        await interaction.reply({ content: 'Unknown subcommand!', ephemeral: true });
    }
  }
});

// Notification functions
const sendNewLicenseNotification = async (licenseData) => {
  if (!BOT_CONFIG.channelId || !BOT_CONFIG.notificationSettings.newLicense) return;

  const channel = client.channels.cache.get(BOT_CONFIG.channelId);
  if (!channel) return;

  const embed = createEmbed(
    '🎉 New License Created',
    'A new license has been generated',
    0x00ff00,
    [
      { name: 'Plugin', value: licenseData.plugin, inline: true },
      { name: 'Buyer', value: licenseData.buyer, inline: true },
      { name: 'Server', value: licenseData.server, inline: true },
      { name: 'License Key', value: `\`${licenseData.key}\``, inline: false },
      { name: 'Expires', value: new Date(licenseData.expiresAt).toLocaleDateString(), inline: true }
    ]
  );

  await channel.send({ embeds: [embed] });
};

const sendInvalidLicenseAttempt = async (key, plugin, server, reason) => {
  if (!BOT_CONFIG.channelId || !BOT_CONFIG.notificationSettings.invalidAttempts) return;

  const channel = client.channels.cache.get(BOT_CONFIG.channelId);
  if (!channel) return;

  const embed = createEmbed(
    '⚠️ Invalid License Attempt',
    `Someone tried to use an invalid license`,
    0xff6600,
    [
      { name: 'License Key', value: `\`${key}\``, inline: false },
      { name: 'Plugin', value: plugin, inline: true },
      { name: 'Server', value: server, inline: true },
      { name: 'Reason', value: reason, inline: true }
    ]
  );

  await channel.send({ embeds: [embed] });
};

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN);

// Export functions for external use
module.exports = {
  sendNewLicenseNotification,
  sendInvalidLicenseAttempt,
  client
};

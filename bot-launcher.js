const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class BotLauncher {
  constructor() {
    this.botProcess = null;
    this.configFile = path.join(__dirname, 'bot-config.json');
    this.botScript = path.join(__dirname, 'bot', 'index.js');
  }

  // Save bot configuration to file
  saveConfig(config) {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
      console.log('✅ Bot configuration saved');
      return true;
    } catch (error) {
      console.error('❌ Failed to save bot configuration:', error.message);
      return false;
    }
  }

  // Load bot configuration from file
  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
        console.log('✅ Bot configuration loaded');
        return config;
      }
    } catch (error) {
      console.error('❌ Failed to load bot configuration:', error.message);
    }
    return null;
  }

  // Start the Discord bot
  startBot(config) {
    if (this.botProcess) {
      console.log('⚠️ Bot is already running');
      return false;
    }

    if (!config || !config.token || !config.channelId) {
      console.error('❌ Invalid bot configuration');
      return false;
    }

    // Save configuration
    if (!this.saveConfig(config)) {
      return false;
    }

    // Set environment variables for the bot
    const env = {
      ...process.env,
      DISCORD_BOT_TOKEN: config.token,
      DISCORD_CHANNEL_ID: config.channelId,
      ADMIN_ROLE_IDS: config.adminRoles ? config.adminRoles.join(',') : '',
      API_URL: 'http://localhost:4000/api'
    };

    console.log('🚀 Starting Discord bot...');
    
    // Start the bot process
    this.botProcess = spawn('node', [this.botScript], {
      env,
      stdio: 'inherit',
      cwd: __dirname
    });

    this.botProcess.on('error', (error) => {
      console.error('❌ Bot process error:', error.message);
      this.botProcess = null;
    });

    this.botProcess.on('exit', (code) => {
      console.log(`🤖 Bot process exited with code ${code}`);
      this.botProcess = null;
    });

    console.log('✅ Discord bot started successfully');
    return true;
  }

  // Stop the Discord bot
  stopBot() {
    if (this.botProcess) {
      console.log('🛑 Stopping Discord bot...');
      this.botProcess.kill('SIGTERM');
      this.botProcess = null;
      console.log('✅ Discord bot stopped');
      return true;
    } else {
      console.log('⚠️ Bot is not running');
      return false;
    }
  }

  // Get bot status
  getStatus() {
    return {
      isRunning: this.botProcess !== null,
      pid: this.botProcess ? this.botProcess.pid : null,
      config: this.loadConfig()
    };
  }

  // Restart the bot
  restartBot(config) {
    console.log('🔄 Restarting Discord bot...');
    this.stopBot();
    setTimeout(() => {
      this.startBot(config);
    }, 1000);
  }
}

// CLI interface
if (require.main === module) {
  const launcher = new BotLauncher();
  const command = process.argv[2];
  const configFile = process.argv[3];

  switch (command) {
    case 'start':
      if (configFile && fs.existsSync(configFile)) {
        const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        launcher.startBot(config);
      } else {
        console.error('❌ Please provide a valid config file path');
        process.exit(1);
      }
      break;
    
    case 'stop':
      launcher.stopBot();
      break;
    
    case 'restart':
      if (configFile && fs.existsSync(configFile)) {
        const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        launcher.restartBot(config);
      } else {
        console.error('❌ Please provide a valid config file path');
        process.exit(1);
      }
      break;
    
    case 'status':
      const status = launcher.getStatus();
      console.log('Bot Status:', JSON.stringify(status, null, 2));
      break;
    
    default:
      console.log('Usage: node bot-launcher.js <start|stop|restart|status> [config-file]');
      console.log('Example: node bot-launcher.js start bot-config.json');
  }
}

module.exports = BotLauncher;

// Sample Minecraft Plugin with License Validation
// This demonstrates how to integrate license validation into your plugin

// Auto-generated license validation code
// DO NOT MODIFY - This code validates your license
const LICENSE_KEY = "YOUR_LICENSE_KEY_HERE";
const PLUGIN_NAME = "YourPluginName";
const API_URL = "http://localhost:4000/api";

async function validateLicense() {
  try {
    const response = await fetch(API_URL + "/licenses/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: LICENSE_KEY,
        plugin: PLUGIN_NAME,
        server: window.location.hostname
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log("✅ License valid for " + result.data.buyer);
      console.log("📅 Expires: " + new Date(result.data.expiresAt).toLocaleDateString());
      return true;
    } else {
      console.error("❌ License invalid: " + result.message);
      return false;
    }
  } catch (error) {
    console.error("❌ License validation failed:", error);
    return false;
  }
}

// Validate license on plugin load
validateLicense().then(valid => {
  if (!valid) {
    console.error("🚫 Plugin disabled - Invalid license");
    // Disable plugin functionality here
    return;
  }
  console.log("🎮 Plugin loaded successfully with valid license");
});

// Your plugin code goes here
class MyMinecraftPlugin {
  constructor() {
    this.isLicensed = false;
    this.init();
  }

  async init() {
    // Check license before initializing plugin
    const licenseValid = await validateLicense();
    
    if (!licenseValid) {
      console.error("🚫 Plugin initialization failed - Invalid license");
      this.showLicenseError();
      return;
    }

    this.isLicensed = true;
    console.log("🎮 Plugin initialized successfully!");
    this.startPlugin();
  }

  startPlugin() {
    // Your plugin functionality here
    console.log("🚀 Plugin is running with valid license!");
    
    // Example: Add event listeners, commands, etc.
    this.setupCommands();
    this.setupEvents();
  }

  setupCommands() {
    // Example command setup
    console.log("📝 Commands registered");
  }

  setupEvents() {
    // Example event setup
    console.log("🎯 Events registered");
  }

  showLicenseError() {
    // Show error message to user
    console.error("❌ This plugin requires a valid license to run!");
    console.error("💳 Please purchase a license from the plugin store.");
  }

  // Method to check license status anytime
  async checkLicenseStatus() {
    if (!this.isLicensed) {
      console.warn("⚠️ Plugin not licensed");
      return false;
    }

    const valid = await validateLicense();
    if (!valid) {
      this.isLicensed = false;
      console.error("🚫 License expired or invalid - Plugin disabled");
      this.showLicenseError();
    }
    return valid;
  }
}

// Initialize plugin
const plugin = new MyMinecraftPlugin();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MyMinecraftPlugin;
}

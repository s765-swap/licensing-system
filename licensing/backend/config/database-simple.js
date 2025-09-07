// Simple in-memory database for development/testing
// This replaces MongoDB for quick testing

let users = [];
let licenses = [];
let plugins = [];

// User operations
const createUser = async (userData) => {
  const user = {
    _id: Date.now().toString(),
    ...userData,
    createdAt: new Date()
  };
  users.push(user);
  return user;
};

const findUserByEmail = async (email) => {
  return users.find(user => user.email === email);
};

const findUserById = async (id) => {
  return users.find(user => user._id === id);
};

// License operations
const createLicense = async (licenseData) => {
  const license = {
    _id: Date.now().toString(),
    ...licenseData,
    createdAt: new Date(),
    allowedServers: licenseData.allowedServers || [], // Array of IP:Port combinations
    maxServers: licenseData.maxServers || 1
  };
  licenses.push(license);
  return license;
};

const findLicenseByKey = async (key) => {
  return licenses.find(license => license.key === key);
};

const findLicensesByUser = async (userId) => {
  return licenses.filter(license => license.createdBy === userId);
};

const updateLicense = async (key, updateData) => {
  const index = licenses.findIndex(license => license.key === key);
  if (index !== -1) {
    licenses[index] = { ...licenses[index], ...updateData };
    return licenses[index];
  }
  return null;
};

const addServerToLicense = async (key, serverInfo) => {
  const license = licenses.find(l => l.key === key);
  if (license) {
    if (license.allowedServers.length >= license.maxServers) {
      throw new Error(`Maximum server limit reached (${license.maxServers})`);
    }
    
    const serverExists = license.allowedServers.some(s => 
      s.ip === serverInfo.ip && s.port === serverInfo.port
    );
    
    if (serverExists) {
      throw new Error('Server already added to this license');
    }
    
    license.allowedServers.push({
      ip: serverInfo.ip,
      port: serverInfo.port,
      name: serverInfo.name || `${serverInfo.ip}:${serverInfo.port}`,
      addedAt: new Date()
    });
    
    return license;
  }
  return null;
};

const removeServerFromLicense = async (key, serverInfo) => {
  const license = licenses.find(l => l.key === key);
  if (license) {
    license.allowedServers = license.allowedServers.filter(s => 
      !(s.ip === serverInfo.ip && s.port === serverInfo.port)
    );
    return license;
  }
  return null;
};

const countLicensesByUser = async (userId) => {
  return licenses.filter(license => license.createdBy === userId).length;
};

// Plugin operations
const createPlugin = async (pluginData) => {
  const plugin = {
    _id: Date.now().toString(),
    ...pluginData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  plugins.push(plugin);
  return plugin;
};

const findPluginsByUser = async (userId) => {
  if (userId === 'all') {
    return plugins.filter(plugin => plugin.isActive !== false);
  }
  return plugins.filter(plugin => plugin.createdBy === userId && plugin.isActive !== false);
};

const findPluginById = async (id) => {
  return plugins.find(plugin => plugin._id === id);
};

const updatePlugin = async (id, updateData) => {
  const index = plugins.findIndex(plugin => plugin._id === id);
  if (index !== -1) {
    plugins[index] = { ...plugins[index], ...updateData, updatedAt: new Date() };
    return plugins[index];
  }
  return null;
};

module.exports = {
  // User operations
  createUser,
  findUserByEmail,
  findUserById,
  
  // License operations
  createLicense,
  findLicenseByKey,
  findLicensesByUser,
  updateLicense,
  countLicensesByUser,
  addServerToLicense,
  removeServerFromLicense,
  
  // Plugin operations
  createPlugin,
  findPluginsByUser,
  findPluginById,
  updatePlugin,
  
  // Database info
  getStats: () => ({
    users: users.length,
    licenses: licenses.length,
    plugins: plugins.length
  })
};

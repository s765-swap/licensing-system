// Complete SaaS Licensing Platform for Minecraft Plugin Developers
// Features: Auth, License Management, Plugin Management, Discord Bot Config

// Global state
let state = {
  view: 'login',
  user: null,
  plugins: [],
  licenses: [],
  storePlugins: [], // Available plugins in store
  apiUrl: 'http://localhost:4000/api', // Backend API URL
  token: localStorage.getItem('token') || null
};

// Authentication functions
function renderLogin() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-blue-700 mb-2">Licensing SaaS</h1>
          <p class="text-gray-600">Sell & manage licenses for your Minecraft plugins</p>
        </div>
        <form id="loginForm">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input type="email" id="loginEmail" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="your@email.com" required>
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input type="password" id="loginPassword" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" required>
          </div>
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
            Sign In
          </button>
        </form>
        <div class="text-center mt-6">
          <p class="text-gray-600">Don't have an account? 
            <a href="#" id="showRegister" class="text-blue-600 hover:underline font-semibold">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

function renderRegister() {
  return `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-purple-700 mb-2">Create Account</h1>
          <p class="text-gray-600">Start selling licenses for your plugins</p>
        </div>
        <form id="registerForm">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
            <input type="text" id="regName" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="John Doe" required>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input type="email" id="regEmail" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="your@email.com" required>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input type="password" id="regPassword" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="••••••••" required>
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2">Discord ID (Optional)</label>
            <input type="text" id="regDiscord" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="123456789012345678">
          </div>
          <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
            Create Account
          </button>
        </form>
        <div class="text-center mt-6">
          <p class="text-gray-600">Already have an account? 
            <a href="#" id="showLogin" class="text-purple-600 hover:underline font-semibold">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

// Sidebar navigation
function renderSidebar() {
  return `
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-center h-20 border-b">
        <div class="text-center">
          <span class="text-2xl font-bold text-blue-700 tracking-tight">Licensing SaaS</span>
          <p class="text-xs text-gray-500">Minecraft Plugin Licensing</p>
        </div>
      </div>
      <nav class="flex-1 py-6">
        <ul class="space-y-2">
          <li>
            <a href="#" data-nav="dashboard" class="flex items-center px-6 py-3 rounded-lg transition ${state.view === 'dashboard' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m0 0H7m6 0h6"/></svg>
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" data-nav="plugins" class="flex items-center px-6 py-3 rounded-lg transition ${state.view === 'plugins' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
              My Plugins
            </a>
          </li>
          <li>
            <a href="#" data-nav="licenses" class="flex items-center px-6 py-3 rounded-lg transition ${state.view === 'licenses' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6"/></svg>
              Licenses
            </a>
          </li>
          <li>
            <a href="#" data-nav="store" class="flex items-center px-6 py-3 rounded-lg transition ${state.view === 'store' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              Plugin Store
            </a>
          </li>
          <li>
            <a href="#" data-nav="discord" class="flex items-center px-6 py-3 rounded-lg transition ${state.view === 'discord' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}">
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              Discord Bot
            </a>
          </li>
        </ul>
      </nav>
      <div class="p-6 border-t">
        <div class="text-xs text-gray-400 text-center">
          <p>&copy; 2025 Licensing SaaS</p>
          <p>For Minecraft Plugin Developers</p>
        </div>
      </div>
    </div>
  `;
}

// Top bar with user info
function renderTopbar() {
  return `
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center space-x-4">
        <button id="mobileMenuBtn" class="md:hidden p-2 rounded-lg hover:bg-gray-100">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <h1 class="text-xl font-semibold text-gray-800">${getPageTitle()}</h1>
      </div>
      <div class="flex items-center space-x-4">
        <div class="hidden md:flex items-center space-x-3">
          <span class="text-gray-700 font-medium">${state.user?.name || 'Developer'}</span>
          <img src="https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(state.user?.email || 'user')}" class="w-8 h-8 rounded-full border-2 border-gray-200" alt="avatar" />
        </div>
        <button id="logoutBtn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200">
          Logout
        </button>
      </div>
    </div>
  `;
}

function getPageTitle() {
  const titles = {
    dashboard: 'Dashboard',
    plugins: 'My Plugins',
    licenses: 'License Management',
    store: 'Plugin Store',
    discord: 'Discord Bot Config'
  };
  return titles[state.view] || 'Dashboard';
}

// Dashboard view
function renderDashboard() {
  const totalLicenses = state.licenses.length;
  const activeLicenses = state.licenses.filter(l => l.status === 'active').length;
  const revokedLicenses = state.licenses.filter(l => l.status === 'revoked').length;
  const totalPlugins = state.plugins.length;

  return `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Welcome back, ${state.user?.name || 'Developer'}!</h1>
          <p class="text-gray-600 mt-1">Manage your Minecraft plugin licenses and grow your business</p>
        </div>
        <div class="flex space-x-3">
          <button onclick="showCreateLicenseModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Create License
          </button>
          <button onclick="showCreatePluginModal()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
            Add Plugin
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium">Total Plugins</p>
              <p class="text-3xl font-bold">${totalPlugins}</p>
            </div>
            <svg class="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
          </div>
        </div>
        
        <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium">Total Licenses</p>
              <p class="text-3xl font-bold">${totalLicenses}</p>
            </div>
            <svg class="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6"/></svg>
          </div>
        </div>
        
        <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-emerald-100 text-sm font-medium">Active Licenses</p>
              <p class="text-3xl font-bold">${activeLicenses}</p>
            </div>
            <svg class="w-8 h-8 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>
        
        <div class="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-red-100 text-sm font-medium">Revoked</p>
              <p class="text-3xl font-bold">${revokedLicenses}</p>
            </div>
            <svg class="w-8 h-8 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Licenses</h3>
          <div class="space-y-3">
            ${state.licenses.slice(0, 5).map(license => `
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="font-medium text-gray-900">${license.plugin}</p>
                  <p class="text-sm text-gray-500">${license.buyer}</p>
                </div>
                <span class="px-2 py-1 text-xs rounded-full ${license.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                  ${license.status}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button onclick="showCreateLicenseModal()" class="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition duration-200">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                <span class="font-medium text-blue-900">Generate New License</span>
              </div>
            </button>
            <button onclick="state.view = 'discord'; render();" class="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition duration-200">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                <span class="font-medium text-purple-900">Setup Discord Bot</span>
              </div>
            </button>
            <button onclick="showValidationPage()" class="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition duration-200">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span class="font-medium text-green-900">Validate License</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Main render function
function render() {
  const root = document.getElementById('root');
  
  if (state.view === 'login') {
    root.innerHTML = renderLogin();
    setupLoginEvents();
  } else if (state.view === 'register') {
    root.innerHTML = renderRegister();
    setupRegisterEvents();
  } else {
    // Dashboard views
    root.innerHTML = `
      <div class="flex min-h-screen bg-gray-50">
        <aside id="sidebar" class="hidden md:flex flex-col w-64 bg-white shadow-lg z-20">
          ${renderSidebar()}
        </aside>
        <div class="flex-1 flex flex-col">
          <header class="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            ${renderTopbar()}
          </header>
          <main class="flex-1 p-6">
            ${state.view === 'dashboard' ? renderDashboard() : ''}
            ${state.view === 'plugins' ? renderPlugins() : ''}
            ${state.view === 'licenses' ? renderLicenses() : ''}
            ${state.view === 'store' ? renderStore() : ''}
            ${state.view === 'discord' ? renderDiscordConfig() : ''}
          </main>
        </div>
      </div>
      
      <!-- Global Modals -->
      ${renderGlobalModals()}
    `;
    setupDashboardEvents();
  }
}

// API helper functions
async function apiRequest(endpoint, method = 'GET', data = null) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (state.token) {
    config.headers.Authorization = `Bearer ${state.token}`;
  }

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${state.apiUrl}${endpoint}`, config);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API request failed');
    }
    
    return result;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Event handlers
function setupLoginEvents() {
  document.getElementById('showRegister').onclick = (e) => {
    e.preventDefault();
    state.view = 'register';
    render();
  };
  
  document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      const result = await apiRequest('/auth/login', 'POST', { email, password });
      
      state.token = result.data.token;
      state.user = result.data;
      localStorage.setItem('token', state.token);
      
    state.view = 'dashboard';
      await loadUserData();
    render();
    } catch (error) {
      showErrorModal('Login Failed', error.message);
    }
  };
}

function setupRegisterEvents() {
  document.getElementById('showLogin').onclick = (e) => {
    e.preventDefault();
    state.view = 'login';
    render();
  };
  
  document.getElementById('registerForm').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const discord = document.getElementById('regDiscord').value;
    
    try {
      const result = await apiRequest('/auth/register', 'POST', { 
        name, 
        email, 
        password, 
        discordId: discord || null 
      });
      
      state.token = result.data.token;
      state.user = result.data;
      localStorage.setItem('token', state.token);
      
    state.view = 'dashboard';
      await loadUserData();
    render();
    } catch (error) {
      showErrorModal('Registration Failed', error.message);
    }
  };
}

function setupDashboardEvents() {
  // Navigation
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.onclick = (e) => {
      e.preventDefault();
      state.view = el.getAttribute('data-nav');
      render();
    };
  });
  
  // Logout
  document.getElementById('logoutBtn').onclick = () => {
    state.user = null;
    state.token = null;
    state.plugins = [];
    state.licenses = [];
    localStorage.removeItem('token');
    state.view = 'login';
    render();
  };
}

// Load user data from API
async function loadUserData() {
  try {
    // Load plugins
    const pluginsResult = await apiRequest('/plugins');
    state.plugins = pluginsResult.data || [];
    
    // Load licenses
    const licensesResult = await apiRequest('/licenses');
    state.licenses = licensesResult.data || [];
    
    // Load store plugins (all plugins from all developers)
    await loadStorePlugins();
  } catch (error) {
    console.error('Error loading user data:', error);
    // If token is invalid, logout user
    if (error.message.includes('token') || error.message.includes('authorized')) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      state.view = 'login';
      render();
    }
  }
}

// Load store plugins
async function loadStorePlugins() {
  try {
    // Load plugins from API (real-time)
    const result = await apiRequest('/store/plugins');
    state.storePlugins = result.data || [];
  } catch (error) {
    console.error('Error loading store plugins:', error);
    // Fallback to sample plugins if API fails
    state.storePlugins = [
      {
        _id: '1',
        name: 'UltraEconomy',
        description: 'Advanced economy system with banks, shops, and auctions',
        price: 25.99,
        version: '2.1.0',
        createdBy: 'admin',
        downloadUrl: 'https://example.com/ultra-economy.jar'
      }
    ];
  }
}

// Plugin management view
function renderPlugins() {
  return `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">My Plugins</h1>
          <p class="text-gray-600 mt-1">Manage your Minecraft plugins and their licensing</p>
        </div>
        <button onclick="showCreatePluginModal()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          Add Plugin
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${state.plugins.map(plugin => `
          <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition duration-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">${plugin.name}</h3>
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>
            </div>
            <p class="text-gray-600 mb-4">${plugin.description}</p>
            <div class="flex items-center justify-between">
              <span class="text-2xl font-bold text-purple-600">$${plugin.price}</span>
              <div class="flex space-x-2">
                <button onclick="editPlugin(${plugin.id})" class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm transition duration-200">
                  Edit
                </button>
                <button onclick="createLicenseForPlugin('${plugin.name}')" class="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm transition duration-200">
                  Create License
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Create Plugin Modal -->
      <div id="createPluginModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Create New Plugin</h3>
          <form id="createPluginForm">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Plugin Name</label>
              <input type="text" name="name" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter plugin name" required>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea name="description" rows="3" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Describe your plugin" required></textarea>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
              <input type="number" name="price" step="0.01" min="0" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0.00" required>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Version</label>
              <input type="text" name="version" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="1.0.0" value="1.0.0">
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Download URL (Optional)</label>
              <input type="url" name="downloadUrl" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://example.com/plugin.jar">
            </div>
            <div class="flex space-x-3">
              <button type="button" onclick="closeCreatePluginModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200">
                Cancel
              </button>
              <button type="button" onclick="createPlugin()" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                Create Plugin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// License management view
function renderLicenses() {
  return `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">License Management</h1>
          <p class="text-gray-600 mt-1">View, manage, and track all your plugin licenses</p>
        </div>
        <div class="flex space-x-3">
          <button onclick="showCreateLicenseModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Create License
          </button>
          <button onclick="exportLicenses()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Export
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex flex-wrap gap-4">
          <select class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Plugins</option>
            ${state.plugins.map(plugin => `<option>${plugin.name}</option>`).join('')}
          </select>
          <select class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Revoked</option>
            <option>Expired</option>
          </select>
          <input type="text" placeholder="Search by buyer or server..." class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-64">
        </div>
      </div>

      <!-- Licenses Table -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Key</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plugin</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Server</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${state.licenses.map(license => `
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <code class="text-sm bg-gray-100 px-2 py-1 rounded">${license.key.substring(0, 8)}...</code>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${license.plugin}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${license.buyer}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${license.server}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${license.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                      ${license.status}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${license.expiresAt}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button onclick="viewLicense('${license.key}')" class="text-blue-600 hover:text-blue-900">View</button>
                      ${license.status === 'active' ? 
                        `<button onclick="revokeLicense('${license.key}')" class="text-red-600 hover:text-red-900">Revoke</button>` :
                        `<button onclick="reactivateLicense('${license.key}')" class="text-green-600 hover:text-green-900">Reactivate</button>`
                      }
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Plugin store view
function renderStore() {
  return `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Plugin Store</h1>
          <p class="text-gray-600 mt-1">Purchase licenses for premium Minecraft plugins</p>
        </div>
        <div class="flex items-center space-x-4">
          <button onclick="refreshStore()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Refresh Store
          </button>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            <span class="text-sm text-gray-600">Store Online</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${state.storePlugins.map(plugin => `
          <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition duration-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">${plugin.name}</h3>
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">v${plugin.version}</span>
            </div>
            <p class="text-gray-600 mb-4">${plugin.description}</p>
            <div class="flex items-center justify-between mb-4">
              <span class="text-2xl font-bold text-green-600">$${plugin.price}</span>
              <span class="text-sm text-gray-500">One-time purchase</span>
            </div>
            <button onclick="showPurchaseModal('${plugin._id}', '${plugin.name}', ${plugin.price})" class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"/></svg>
              Purchase License
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Purchase Modal -->
      <div id="purchaseModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Purchase License</h3>
          <form id="purchaseForm">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Plugin</label>
              <input type="text" id="purchasePlugin" class="w-full px-3 py-2 border rounded-lg bg-gray-100" readonly>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <input type="text" id="purchasePrice" class="w-full px-3 py-2 border rounded-lg bg-gray-100" readonly>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input type="text" id="buyerName" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Enter your name" required>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Maximum Servers</label>
              <select id="maxServers" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                <option value="1">1 Server</option>
                <option value="3">3 Servers</option>
                <option value="5">5 Servers</option>
                <option value="10">10 Servers</option>
                <option value="unlimited">Unlimited</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">How many servers can use this license?</p>
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select id="paymentMethod" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                <option value="">Select payment method</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Credit Card</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="admin_free">Admin Free (Testing)</option>
              </select>
            </div>
            <div class="flex space-x-3">
              <button type="button" onclick="closePurchaseModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200">
                Cancel
              </button>
              <button type="submit" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                Purchase
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Global modals
function renderGlobalModals() {
  return `
    <!-- Success Modal -->
    <div id="successModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 id="successTitle" class="text-xl font-semibold text-gray-900">Success!</h3>
        </div>
        <p id="successMessage" class="text-gray-600 mb-6"></p>
        <button onclick="closeModal('successModal')" class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
          OK
        </button>
      </div>
    </div>

    <!-- Error Modal -->
    <div id="errorModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h3 id="errorTitle" class="text-xl font-semibold text-gray-900">Error!</h3>
        </div>
        <p id="errorMessage" class="text-gray-600 mb-6"></p>
        <button onclick="closeModal('errorModal')" class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
          OK
        </button>
      </div>
    </div>

    <!-- License Success Modal -->
    <div id="licenseSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900">License Purchased Successfully!</h3>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 class="font-semibold text-gray-900 mb-2">License Details:</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-600">Plugin:</span>
              <span id="licensePlugin" class="ml-2 text-gray-900"></span>
            </div>
            <div>
              <span class="font-medium text-gray-600">Buyer:</span>
              <span id="licenseBuyer" class="ml-2 text-gray-900"></span>
            </div>
            <div>
              <span class="font-medium text-gray-600">License Key:</span>
              <span id="licenseKey" class="ml-2 text-gray-900 font-mono text-xs"></span>
            </div>
            <div>
              <span class="font-medium text-gray-600">Expires:</span>
              <span id="licenseExpires" class="ml-2 text-gray-900"></span>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <h4 class="font-semibold text-gray-900 mb-2">Embedded License Code:</h4>
          <div class="bg-gray-900 rounded-lg p-4 relative">
            <pre id="embeddedCode" class="text-green-400 text-xs overflow-x-auto whitespace-pre-wrap"></pre>
            <button onclick="copyToClipboard(document.getElementById('embeddedCode').textContent)" class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs transition duration-200">
              Copy
            </button>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 class="font-semibold text-blue-900 mb-2">📋 Instructions:</h4>
          <ol class="text-sm text-blue-800 space-y-1">
            <li>1. Copy the embedded code above</li>
            <li>2. Paste it at the top of your plugin file</li>
            <li>3. Replace "YOUR_LICENSE_KEY_HERE" with your actual license key</li>
            <li>4. Add your server IP:Port in the license management panel</li>
            <li>5. Your plugin will only work on registered servers</li>
          </ol>
        </div>

        <div class="flex space-x-3">
          <button onclick="showServerManagementModal(document.getElementById('licenseKey').textContent)" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Manage Servers
          </button>
          <button onclick="closeModal('licenseSuccessModal')" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
            Got it!
          </button>
        </div>
      </div>
    </div>

    <!-- Server Management Modal -->
    <div id="serverManagementModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-900">Server Management</h3>
          <button onclick="closeModal('serverManagementModal')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div class="mb-6">
          <h4 class="font-semibold text-gray-900 mb-2">Add New Server</h4>
          <form id="addServerForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Server IP</label>
              <input type="text" id="serverIp" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="192.168.1.100" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <input type="number" id="serverPort" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="25565" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Server Name (Optional)</label>
              <input type="text" id="serverName" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="My Server">
            </div>
          </form>
          <button onclick="addServerToLicense()" class="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Add Server
          </button>
        </div>

        <div>
          <h4 class="font-semibold text-gray-900 mb-2">Registered Servers</h4>
          <div id="serverList" class="space-y-2">
            <!-- Servers will be loaded here -->
          </div>
        </div>
      </div>
    </div>

    <!-- Discord Bot Modal -->
    <div id="discordBotModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-900">Discord Bot Configuration</h3>
          <button onclick="closeModal('discordBotModal')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div class="space-y-6">
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 class="font-semibold text-purple-900 mb-2">🤖 Bot Status</h4>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-sm text-purple-800">Bot is online and ready</span>
            </div>
          </div>

          <form id="discordConfigForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Discord Bot Token</label>
                <input type="password" id="botToken" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Your Discord bot token">
                <p class="text-xs text-gray-500 mt-1">Get this from Discord Developer Portal</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Channel ID</label>
                <input type="text" id="channelId" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="123456789012345678">
                <p class="text-xs text-gray-500 mt-1">Channel for license notifications</p>
              </div>
            </div>
            
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Admin Role IDs</label>
              <input type="text" id="adminRoles" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="123456789012345678, 987654321098765432">
              <p class="text-xs text-gray-500 mt-1">Comma-separated role IDs that can manage licenses</p>
            </div>
          </form>

          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-semibold text-gray-900 mb-2">Available Commands</h4>
            <div class="space-y-2 text-sm">
              <div class="flex items-center space-x-2">
                <code class="bg-gray-200 px-2 py-1 rounded text-xs">/license check &lt;key&gt; &lt;plugin&gt; &lt;server&gt;</code>
                <span class="text-gray-600">Validate a license</span>
              </div>
              <div class="flex items-center space-x-2">
                <code class="bg-gray-200 px-2 py-1 rounded text-xs">/license info &lt;key&gt;</code>
                <span class="text-gray-600">Get license details</span>
              </div>
              <div class="flex items-center space-x-2">
                <code class="bg-gray-200 px-2 py-1 rounded text-xs">/license revoke &lt;key&gt;</code>
                <span class="text-gray-600">Revoke a license (Admin only)</span>
              </div>
              <div class="flex items-center space-x-2">
                <code class="bg-gray-200 px-2 py-1 rounded text-xs">/license stats</code>
                <span class="text-gray-600">View license statistics</span>
              </div>
            </div>
          </div>

          <div class="flex space-x-3">
            <button onclick="startDiscordBot()" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
              <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              Start Bot
            </button>
            <button onclick="closeModal('discordBotModal')" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Discord bot configuration view
function renderDiscordConfig() {
  return `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Discord Bot Configuration</h1>
          <p class="text-gray-600 mt-1">Setup your Discord bot for license notifications and management</p>
        </div>
        <button onclick="showDiscordBotModal()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-200">
          <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
          Configure Bot
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Bot Settings -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Bot Settings</h3>
          <form class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Discord Channel ID</label>
              <input type="text" placeholder="123456789012345678" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <p class="text-xs text-gray-500 mt-1">Channel where license notifications will be sent</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Admin Role IDs</label>
              <input type="text" placeholder="123456789012345678, 987654321098765432" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <p class="text-xs text-gray-500 mt-1">Comma-separated list of role IDs that can manage licenses</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Bot Token</label>
              <input type="password" placeholder="Your Discord bot token" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <p class="text-xs text-gray-500 mt-1">Keep this secure! Never share your bot token</p>
            </div>
            <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
              Save Configuration
            </button>
          </form>
        </div>

        <!-- Bot Commands -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Available Commands</h3>
          <div class="space-y-4">
            <div class="border-l-4 border-blue-500 pl-4">
              <h4 class="font-medium text-gray-900">/license check &lt;key&gt;</h4>
              <p class="text-sm text-gray-600">Validate a license key</p>
            </div>
            <div class="border-l-4 border-green-500 pl-4">
              <h4 class="font-medium text-gray-900">/license info &lt;key&gt;</h4>
              <p class="text-sm text-gray-600">Get detailed license information</p>
            </div>
            <div class="border-l-4 border-red-500 pl-4">
              <h4 class="font-medium text-gray-900">/license revoke &lt;key&gt;</h4>
              <p class="text-sm text-gray-600">Revoke a license (Admin only)</p>
            </div>
            <div class="border-l-4 border-purple-500 pl-4">
              <h4 class="font-medium text-gray-900">/license stats</h4>
              <p class="text-sm text-gray-600">View license statistics</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <label class="flex items-center">
              <input type="checkbox" checked class="rounded border-gray-300 text-purple-600 focus:ring-purple-500">
              <span class="ml-2 text-sm text-gray-700">New license created</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" checked class="rounded border-gray-300 text-purple-600 focus:ring-purple-500">
              <span class="ml-2 text-sm text-gray-700">License revoked</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" class="rounded border-gray-300 text-purple-600 focus:ring-purple-500">
              <span class="ml-2 text-sm text-gray-700">License expired</span>
            </label>
          </div>
          <div class="space-y-4">
            <label class="flex items-center">
              <input type="checkbox" checked class="rounded border-gray-300 text-purple-600 focus:ring-purple-500">
              <span class="ml-2 text-sm text-gray-700">Invalid license attempts</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" class="rounded border-gray-300 text-purple-600 focus:ring-purple-500">
              <span class="ml-2 text-sm text-gray-700">Daily summary</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" class="rounded border-gray-300 text-purple-600 focus:ring-purple-500">
              <span class="ml-2 text-sm text-gray-700">Weekly report</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Global functions for modals and actions
window.showCreateLicenseModal = async function() {
  const plugin = prompt('Enter plugin name:');
  const buyer = prompt('Enter buyer name:');
  const server = prompt('Enter server name:');
  const expiresAt = prompt('Enter expiration date (YYYY-MM-DD) or leave empty for 1 year:');
  
  if (plugin && buyer && server) {
    try {
      const result = await apiRequest('/licenses/create', 'POST', {
        plugin,
        buyer,
        server,
        expiresAt: expiresAt || null
      });
      
      state.licenses.unshift(result.data);
    render();
      alert(`License created: ${result.data.key}`);
    } catch (error) {
      showErrorModal('Failed to Create License', error.message);
    }
  }
};

window.showCreatePluginModal = function() {
  document.getElementById('createPluginModal').classList.remove('hidden');
  document.getElementById('createPluginModal').classList.add('flex');
};

window.closeCreatePluginModal = function() {
  document.getElementById('createPluginModal').classList.add('hidden');
  document.getElementById('createPluginModal').classList.remove('flex');
  document.getElementById('createPluginForm').reset();
};

window.createPlugin = async function() {
  const form = document.getElementById('createPluginForm');
  const formData = new FormData(form);
  
  const name = formData.get('name');
  const description = formData.get('description');
  const price = formData.get('price');
  const version = formData.get('version');
  const downloadUrl = formData.get('downloadUrl');
  
  if (name && description && price) {
    try {
      const result = await apiRequest('/plugins', 'POST', {
        name,
        description,
        price: parseFloat(price),
        version: version || '1.0.0',
        downloadUrl: downloadUrl || ''
      });
      
      state.plugins.push(result.data);
      
      // Refresh store plugins to show new plugin
      await loadStorePlugins();
      
    render();
      showSuccessModal(`Plugin "${name}" created successfully!`, 'Your plugin is now available in the Plugin Store for users to purchase.');
      closeCreatePluginModal();
    } catch (error) {
      showErrorModal('Failed to create plugin', error.message);
    }
  }
};

window.showValidationPage = async function() {
  const key = prompt('Enter license key to validate:');
  const plugin = prompt('Enter plugin name:');
  const server = prompt('Enter server name:');
  
  if (key && plugin && server) {
    try {
      const result = await apiRequest('/licenses/validate', 'POST', {
        key,
        plugin,
        server
      });
      
      if (result.success) {
        alert(`License Valid!\nPlugin: ${result.data.plugin}\nBuyer: ${result.data.buyer}\nServer: ${result.data.server}\nStatus: ${result.data.status}\nExpires: ${new Date(result.data.expiresAt).toLocaleDateString()}`);
    } else {
        alert('Invalid license: ' + result.message);
      }
    } catch (error) {
      alert('Validation failed: ' + error.message);
    }
  }
};

window.editPlugin = function(id) {
  alert(`Edit plugin ${id} - Connect to your backend API!`);
};

window.createLicenseForPlugin = async function(pluginName) {
  const buyer = prompt(`Enter buyer name for ${pluginName}:`);
  const server = prompt('Enter server name:');
  const expiresAt = prompt('Enter expiration date (YYYY-MM-DD) or leave empty for 1 year:');
  
  if (buyer && server) {
    try {
      const result = await apiRequest('/licenses/create', 'POST', {
      plugin: pluginName,
        buyer,
        server,
        expiresAt: expiresAt || null
      });
      
      state.licenses.unshift(result.data);
    render();
      alert(`License created for ${pluginName}: ${result.data.key}`);
    } catch (error) {
      showErrorModal('Failed to Create License', error.message);
    }
  }
};

window.exportLicenses = function() {
  const csv = 'License Key,Plugin,Buyer,Server,Status,Expires\n' + 
    state.licenses.map(l => `${l.key},${l.plugin},${l.buyer},${l.server},${l.status},${l.expiresAt}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'licenses.csv';
  a.click();
  window.URL.revokeObjectURL(url);
};

window.viewLicense = function(key) {
  const license = state.licenses.find(l => l.key === key);
  if (license) {
    alert(`License Details:\nKey: ${license.key}\nPlugin: ${license.plugin}\nBuyer: ${license.buyer}\nServer: ${license.server}\nStatus: ${license.status}\nExpires: ${license.expiresAt}`);
  }
};

window.revokeLicense = async function(key) {
  if (confirm('Are you sure you want to revoke this license?')) {
    try {
      const result = await apiRequest('/licenses/revoke', 'POST', { key });
      
    const license = state.licenses.find(l => l.key === key);
    if (license) {
      license.status = 'revoked';
      }
      
      render();
      alert('License revoked successfully!');
    } catch (error) {
      alert('Failed to revoke license: ' + error.message);
    }
  }
};

window.reactivateLicense = async function(key) {
  try {
    const result = await apiRequest(`/licenses/${key}`, 'PUT', { 
      status: 'active' 
    });
    
  const license = state.licenses.find(l => l.key === key);
  if (license) {
    license.status = 'active';
    }
    
    render();
    alert('License reactivated successfully!');
  } catch (error) {
    alert('Failed to reactivate license: ' + error.message);
  }
};

// Purchase modal functions
window.showPurchaseModal = function(pluginId, pluginName, price) {
  document.getElementById('purchasePlugin').value = pluginName;
  document.getElementById('purchasePrice').value = `$${price}`;
  document.getElementById('purchaseForm').setAttribute('data-plugin-id', pluginId);
  document.getElementById('purchaseModal').classList.remove('hidden');
  document.getElementById('purchaseModal').classList.add('flex');
};

window.closePurchaseModal = function() {
  document.getElementById('purchaseModal').classList.add('hidden');
  document.getElementById('purchaseModal').classList.remove('flex');
  document.getElementById('purchaseForm').reset();
};

// Beautiful modal functions
window.showSuccessModal = function(title, message) {
  const modal = document.getElementById('successModal');
  document.getElementById('successTitle').textContent = title;
  document.getElementById('successMessage').textContent = message;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

window.showErrorModal = function(title, message) {
  const modal = document.getElementById('errorModal');
  document.getElementById('errorTitle').textContent = title;
  document.getElementById('errorMessage').textContent = message;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

window.showLicenseSuccessModal = function(license, embeddedCode) {
  const modal = document.getElementById('licenseSuccessModal');
  document.getElementById('licenseKey').textContent = license.key;
  document.getElementById('licensePlugin').textContent = license.plugin;
  document.getElementById('licenseBuyer').textContent = license.buyer;
  document.getElementById('licenseExpires').textContent = new Date(license.expiresAt).toLocaleDateString();
  document.getElementById('embeddedCode').textContent = embeddedCode;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

window.closeModal = function(modalId) {
  document.getElementById(modalId).classList.add('hidden');
  document.getElementById(modalId).classList.remove('flex');
};

window.showConfirmModal = function(title, message, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-gray-900">${title}</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      
      <p class="text-gray-700 mb-6">${message}</p>
      
      <div class="flex space-x-3">
        <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200">
          Cancel
        </button>
        <button onclick="this.closest('.fixed').remove(); (${onConfirm.toString()})()" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
          Confirm
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    showSuccessModal('Copied!', 'Code copied to clipboard successfully!');
  }).catch(() => {
    showErrorModal('Copy Failed', 'Failed to copy to clipboard. Please copy manually.');
  });
};

window.refreshStore = async function() {
  try {
    await loadStorePlugins();
    render();
    showSuccessModal('Store Refreshed', 'Plugin store has been updated with the latest plugins!');
  } catch (error) {
    showErrorModal('Refresh Failed', 'Failed to refresh the store. Please try again.');
  }
};

// Server management functions
window.showServerManagementModal = function(licenseKey) {
  document.getElementById('serverManagementModal').setAttribute('data-license-key', licenseKey);
  document.getElementById('serverManagementModal').classList.remove('hidden');
  document.getElementById('serverManagementModal').classList.add('flex');
  loadServerList(licenseKey);
};

window.addServerToLicense = async function() {
  const licenseKey = document.getElementById('serverManagementModal').getAttribute('data-license-key');
  const ip = document.getElementById('serverIp').value;
  const port = document.getElementById('serverPort').value;
  const name = document.getElementById('serverName').value;

  if (!ip || !port) {
    showErrorModal('Missing Information', 'Please enter both IP and port.');
    return;
  }

  try {
    const result = await apiRequest(`/licenses/${licenseKey}/servers`, 'POST', {
      ip,
      port,
      name: name || `${ip}:${port}`
    });

    if (result.success) {
      showSuccessModal('Server Added', 'Server has been added to your license successfully!');
      document.getElementById('addServerForm').reset();
      loadServerList(licenseKey);
    }
  } catch (error) {
    showErrorModal('Failed to Add Server', error.message);
  }
};

window.loadServerList = async function(licenseKey) {
  try {
    const result = await apiRequest(`/licenses/${licenseKey}`);
    const license = result.data;
    const serverList = document.getElementById('serverList');
    
    if (license.allowedServers && license.allowedServers.length > 0) {
      serverList.innerHTML = license.allowedServers.map(server => `
        <div class="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900">${server.name}</div>
            <div class="text-sm text-gray-500">${server.ip}:${server.port}</div>
            <div class="text-xs text-gray-400">Added: ${new Date(server.addedAt).toLocaleDateString()}</div>
          </div>
          <button onclick="removeServerFromLicense('${server.ip}', ${server.port})" class="text-red-600 hover:text-red-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      `).join('');
    } else {
      serverList.innerHTML = '<p class="text-gray-500 text-center py-4">No servers added yet. Add your first server above.</p>';
    }
  } catch (error) {
    showErrorModal('Failed to Load Servers', error.message);
  }
};

window.removeServerFromLicense = async function(ip, port) {
  const licenseKey = document.getElementById('serverManagementModal').getAttribute('data-license-key');
  
  showConfirmModal(
    'Remove Server',
    `Are you sure you want to remove ${ip}:${port} from this license?`,
    async () => {
      try {
        const result = await apiRequest(`/licenses/${licenseKey}/servers`, 'DELETE', { ip, port });
        
        if (result.success) {
          showSuccessModal('Server Removed', 'Server has been removed from your license.');
          loadServerList(licenseKey);
        }
      } catch (error) {
        showErrorModal('Failed to Remove Server', error.message);
      }
    }
  );
};

// Discord bot functions
window.showDiscordBotModal = function() {
  document.getElementById('discordBotModal').classList.remove('hidden');
  document.getElementById('discordBotModal').classList.add('flex');
};

window.startDiscordBot = function() {
  const botToken = document.getElementById('botToken').value;
  const channelId = document.getElementById('channelId').value;
  const adminRoles = document.getElementById('adminRoles').value;

  if (!botToken) {
    showErrorModal('Missing Bot Token', 'Please enter your Discord bot token.');
    return;
  }

  // Here you would start the Discord bot with the provided configuration
  showSuccessModal('Discord Bot Started', 'Your Discord bot is now running with the provided configuration!');
  closeModal('discordBotModal');
};

// Add purchase form handler
document.addEventListener('submit', async (e) => {
  if (e.target.id === 'purchaseForm') {
    e.preventDefault();
    
      const pluginId = e.target.getAttribute('data-plugin-id');
      const buyerName = document.getElementById('buyerName').value;
      const maxServers = document.getElementById('maxServers').value;
      const paymentMethod = document.getElementById('paymentMethod').value;
      
      try {
        const result = await apiRequest('/purchase/license', 'POST', {
          pluginId,
          buyerName,
          maxServers: maxServers === 'unlimited' ? 999 : parseInt(maxServers),
          paymentMethod
        });
      
        if (result.success) {
          // Add license to user's licenses
          state.licenses.unshift(result.data.license);
          
          closePurchaseModal();
          render();
          
          // Show success modal with embedded code
          showLicenseSuccessModal(result.data.license, result.data.embeddedCode);
        }
    } catch (error) {
      showErrorModal('Purchase Failed', error.message);
    }
  }
});

function generateLicenseKey() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is already logged in
  if (state.token) {
    try {
      const result = await apiRequest('/auth/me');
      state.user = result.data;
      state.view = 'dashboard';
      await loadUserData();
    } catch (error) {
      // Token is invalid, clear it
      state.token = null;
      localStorage.removeItem('token');
      state.view = 'login';
    }
  }
  
  render();
});
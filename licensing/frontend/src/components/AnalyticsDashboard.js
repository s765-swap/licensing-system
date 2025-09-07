// Advanced Analytics Dashboard Component
class AnalyticsDashboard {
  constructor() {
    this.charts = {};
    this.data = {};
  }

  async render() {
    return `
      <div class="analytics-dashboard">
        <div class="dashboard-header">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>
          <div class="flex gap-4 mb-6">
            <select id="periodSelect" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="7d">Last 7 days</option>
              <option value="30d" selected>Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button id="exportBtn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Export Data
            </button>
          </div>
        </div>

        <!-- Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Licenses</p>
                <p class="text-2xl font-semibold text-gray-900" id="totalLicenses">-</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-100 text-green-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Active Licenses</p>
                <p class="text-2xl font-semibold text-gray-900" id="activeLicenses">-</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Expired Licenses</p>
                <p class="text-2xl font-semibold text-gray-900" id="expiredLicenses">-</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-red-100 text-red-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Revoked Licenses</p>
                <p class="text-2xl font-semibold text-gray-900" id="revokedLicenses">-</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- License Trend Chart -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">License Creation Trend</h3>
            <div id="licenseTrendChart" class="h-64"></div>
          </div>

          <!-- Plugin Performance Chart -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Plugin Performance</h3>
            <div id="pluginPerformanceChart" class="h-64"></div>
          </div>
        </div>

        <!-- Data Tables -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Recent Licenses -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Licenses</h3>
            <div id="recentLicenses" class="space-y-3">
              <!-- Will be populated by JavaScript -->
            </div>
          </div>

          <!-- Top Buyers -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Top Buyers</h3>
            <div id="topBuyers" class="space-y-3">
              <!-- Will be populated by JavaScript -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async loadData(period = '30d') {
    try {
      const response = await fetch(`${state.apiUrl}/analytics/dashboard?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load analytics data');
      }

      const result = await response.json();
      this.data = result.data;
      this.updateOverviewCards();
      this.updateCharts();
      this.updateTables();
    } catch (error) {
      console.error('Error loading analytics data:', error);
      showNotification('Error loading analytics data', 'error');
    }
  }

  updateOverviewCards() {
    const { overview } = this.data;
    document.getElementById('totalLicenses').textContent = overview.totalLicenses || 0;
    document.getElementById('activeLicenses').textContent = overview.activeLicenses || 0;
    document.getElementById('expiredLicenses').textContent = overview.expiredLicenses || 0;
    document.getElementById('revokedLicenses').textContent = overview.revokedLicenses || 0;
  }

  updateCharts() {
    this.renderLicenseTrendChart();
    this.renderPluginPerformanceChart();
  }

  renderLicenseTrendChart() {
    const { licenseTrend } = this.data;
    const ctx = document.getElementById('licenseTrendChart');
    
    // Simple chart implementation (you can replace with Chart.js or similar)
    if (licenseTrend && licenseTrend.length > 0) {
      const maxValue = Math.max(...licenseTrend.map(item => item.count));
      const chartHeight = 200;
      
      ctx.innerHTML = `
        <div class="flex items-end justify-between h-full">
          ${licenseTrend.map((item, index) => {
            const height = (item.count / maxValue) * chartHeight;
            return `
              <div class="flex flex-col items-center">
                <div class="bg-blue-500 w-8 rounded-t" style="height: ${height}px"></div>
                <span class="text-xs text-gray-600 mt-2">${item.count}</span>
                <span class="text-xs text-gray-500">${index + 1}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      ctx.innerHTML = '<p class="text-gray-500 text-center">No data available</p>';
    }
  }

  renderPluginPerformanceChart() {
    const { pluginStats } = this.data;
    const ctx = document.getElementById('pluginPerformanceChart');
    
    if (pluginStats && pluginStats.length > 0) {
      ctx.innerHTML = `
        <div class="space-y-3">
          ${pluginStats.slice(0, 5).map(plugin => `
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">${plugin._id}</span>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">${plugin.totalLicenses} licenses</span>
                <div class="w-16 bg-gray-200 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full" style="width: ${(plugin.activeLicenses / plugin.totalLicenses) * 100}%"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      ctx.innerHTML = '<p class="text-gray-500 text-center">No data available</p>';
    }
  }

  updateTables() {
    this.updateRecentLicenses();
    this.updateTopBuyers();
  }

  updateRecentLicenses() {
    const { recentLicenses } = this.data;
    const container = document.getElementById('recentLicenses');
    
    if (recentLicenses && recentLicenses.length > 0) {
      container.innerHTML = recentLicenses.map(license => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p class="text-sm font-medium text-gray-800">${license.plugin}</p>
            <p class="text-xs text-gray-600">${license.buyer}</p>
          </div>
          <div class="text-right">
            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              license.status === 'active' ? 'bg-green-100 text-green-800' :
              license.status === 'expired' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }">
              ${license.status}
            </span>
            <p class="text-xs text-gray-500 mt-1">${new Date(license.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p class="text-gray-500 text-center">No recent licenses</p>';
    }
  }

  updateTopBuyers() {
    const { topBuyers } = this.data;
    const container = document.getElementById('topBuyers');
    
    if (topBuyers && topBuyers.length > 0) {
      container.innerHTML = topBuyers.map((buyer, index) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center">
            <span class="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mr-3">
              ${index + 1}
            </span>
            <div>
              <p class="text-sm font-medium text-gray-800">${buyer._id}</p>
              <p class="text-xs text-gray-600">${buyer.licenseCount} licenses</p>
            </div>
          </div>
          <p class="text-xs text-gray-500">${new Date(buyer.lastPurchase).toLocaleDateString()}</p>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p class="text-gray-500 text-center">No buyer data</p>';
    }
  }

  async exportData() {
    try {
      const period = document.getElementById('periodSelect').value;
      const response = await fetch(`${state.apiUrl}/analytics/export?format=csv&period=${period}`, {
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${period}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification('Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('Error exporting data', 'error');
    }
  }

  bindEvents() {
    // Period selector
    document.getElementById('periodSelect').addEventListener('change', (e) => {
      this.loadData(e.target.value);
    });

    // Export button
    document.getElementById('exportBtn').addEventListener('click', () => {
      this.exportData();
    });
  }
}

// Export for use in main.js
window.AnalyticsDashboard = AnalyticsDashboard;

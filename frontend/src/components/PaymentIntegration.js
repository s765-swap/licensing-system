// Payment Integration Component
class PaymentIntegration {
  constructor() {
    this.stripe = null;
    this.elements = null;
    this.cardElement = null;
  }

  async init() {
    // Initialize Stripe
    if (typeof Stripe !== 'undefined') {
      this.stripe = Stripe(window.STRIPE_PUBLISHABLE_KEY);
      this.elements = this.stripe.elements();
    }
  }

  async render() {
    return `
      <div class="payment-integration">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Payment Integration</h2>
          
          <!-- Stripe Checkout Section -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Purchase License</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Plugin Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Select Plugin</label>
                <select id="pluginSelect" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Choose a plugin...</option>
                </select>
              </div>

              <!-- License Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">License Type</label>
                <select id="licenseTypeSelect" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="1-month">1 Month - $5.00</option>
                  <option value="3-months">3 Months - $12.50</option>
                  <option value="6-months">6 Months - $22.50</option>
                  <option value="1-year" selected>1 Year - $40.00</option>
                  <option value="lifetime">Lifetime - $75.00</option>
                </select>
              </div>
            </div>

            <!-- Quantity -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input type="number" id="quantityInput" value="1" min="1" max="10" 
                     class="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <!-- Price Display -->
            <div class="mt-4 p-4 bg-gray-50 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold text-gray-800">Total Price:</span>
                <span class="text-2xl font-bold text-green-600" id="totalPrice">$40.00</span>
              </div>
            </div>

            <!-- Purchase Button -->
            <button id="purchaseBtn" class="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200">
              Purchase with Stripe
            </button>
          </div>

          <!-- Payment History -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Payment History</h3>
            <div id="paymentHistory">
              <!-- Will be populated by JavaScript -->
            </div>
          </div>

          <!-- Customer Portal -->
          <div class="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Manage Billing</h3>
            <p class="text-gray-600 mb-4">Manage your subscription, update payment methods, and view invoices.</p>
            <button id="customerPortalBtn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
              Open Customer Portal
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async loadPlugins() {
    try {
      const response = await fetch(`${state.apiUrl}/plugins`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load plugins');
      }

      const result = await response.json();
      const select = document.getElementById('pluginSelect');
      
      select.innerHTML = '<option value="">Choose a plugin...</option>';
      result.data.forEach(plugin => {
        const option = document.createElement('option');
        option.value = plugin._id;
        option.textContent = `${plugin.name} - $${plugin.price}`;
        select.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading plugins:', error);
      showNotification('Error loading plugins', 'error');
    }
  }

  async loadPaymentHistory() {
    try {
      const response = await fetch(`${state.apiUrl}/payments/history`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load payment history');
      }

      const result = await response.json();
      this.renderPaymentHistory(result.data);
    } catch (error) {
      console.error('Error loading payment history:', error);
      showNotification('Error loading payment history', 'error');
    }
  }

  renderPaymentHistory(payments) {
    const container = document.getElementById('paymentHistory');
    
    if (payments && payments.length > 0) {
      container.innerHTML = `
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plugin</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Key</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${payments.map(payment => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${payment.plugin}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    ${payment.key}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $${payment.amount || '0.00'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'active' ? 'bg-green-100 text-green-800' :
                      payment.status === 'expired' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }">
                      ${payment.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">No payment history found</p>';
    }
  }

  updateTotalPrice() {
    const licenseType = document.getElementById('licenseTypeSelect').value;
    const quantity = parseInt(document.getElementById('quantityInput').value) || 1;
    
    const pricing = {
      '1-month': 5.00,
      '3-months': 12.50,
      '6-months': 22.50,
      '1-year': 40.00,
      'lifetime': 75.00
    };

    const price = pricing[licenseType] || 40.00;
    const total = price * quantity;
    
    document.getElementById('totalPrice').textContent = `$${total.toFixed(2)}`;
  }

  async createCheckoutSession() {
    const pluginId = document.getElementById('pluginSelect').value;
    const licenseType = document.getElementById('licenseTypeSelect').value;
    const quantity = parseInt(document.getElementById('quantityInput').value) || 1;

    if (!pluginId) {
      showNotification('Please select a plugin', 'error');
      return;
    }

    try {
      const response = await fetch(`${state.apiUrl}/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pluginId,
          licenseType,
          quantity
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const result = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = result.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      showNotification('Error creating checkout session', 'error');
    }
  }

  async openCustomerPortal() {
    try {
      const response = await fetch(`${state.apiUrl}/payments/create-portal-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const result = await response.json();
      
      // Open customer portal in new window
      window.open(result.data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      showNotification('Error opening customer portal', 'error');
    }
  }

  bindEvents() {
    // Plugin selection change
    document.getElementById('pluginSelect').addEventListener('change', () => {
      this.updateTotalPrice();
    });

    // License type change
    document.getElementById('licenseTypeSelect').addEventListener('change', () => {
      this.updateTotalPrice();
    });

    // Quantity change
    document.getElementById('quantityInput').addEventListener('change', () => {
      this.updateTotalPrice();
    });

    // Purchase button
    document.getElementById('purchaseBtn').addEventListener('click', () => {
      this.createCheckoutSession();
    });

    // Customer portal button
    document.getElementById('customerPortalBtn').addEventListener('click', () => {
      this.openCustomerPortal();
    });
  }

  async init() {
    await this.loadPlugins();
    await this.loadPaymentHistory();
    this.updateTotalPrice();
    this.bindEvents();
  }
}

// Export for use in main.js
window.PaymentIntegration = PaymentIntegration;

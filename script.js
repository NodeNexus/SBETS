// API Configuration
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

// Global State
let userData = null;
let transactionsData = [];
let analyticsData = null;
let currentMerchant = null;

// 20 DIVERSE MERCHANTS WITH ACCURATE CATEGORIES
const MERCHANTS_POOL = [
    { name: "Blue Tokai Coffee", upi: "bluetokai@okaxis", avatar: "☕", category: "Food" },
    { name: "Domino's Pizza", upi: "dominos@okicici", avatar: "🍕", category: "Food" },
    { name: "McDonald's India", upi: "mcdonalds@okhdfc", avatar: "🍔", category: "Food" },
    { name: "Starbucks", upi: "starbucks@paytm", avatar: "☕", category: "Food" },
    { name: "Subway", upi: "subway.india@oksbi", avatar: "🥪", category: "Food" },

    { name: "Uber Ride", upi: "uber.trip@okaxis", avatar: "🚗", category: "Transport" },
    { name: "Ola Cabs", upi: "ola.india@paytm", avatar: "🚕", category: "Transport" },
    { name: "Rapido Bike", upi: "rapido@okhdfc", avatar: "🏍️", category: "Transport" },
    { name: "Metro Card Recharge", upi: "metro.delhi@oksbi", avatar: "🚇", category: "Transport" },

    { name: "Amazon India", upi: "amazon.in@okicici", avatar: "📦", category: "Shopping" },
    { name: "Flipkart", upi: "flipkart@paytm", avatar: "🛒", category: "Shopping" },
    { name: "Myntra Fashion", upi: "myntra@okaxis", avatar: "👗", category: "Shopping" },
    { name: "Decathlon Sports", upi: "decathlon@okhdfc", avatar: "⚽", category: "Shopping" },

    { name: "MSEB Electric Bill", upi: "mseb.pay@oksbi", avatar: "⚡", category: "Bills" },
    { name: "Jio Recharge", upi: "jio.recharge@paytm", avatar: "📱", category: "Bills" },
    { name: "Airtel Postpaid", upi: "airtel@okaxis", avatar: "📞", category: "Bills" },

    { name: "PVR Cinemas", upi: "pvr.cinemas@okicici", avatar: "🎬", category: "Entertainment" },
    { name: "BookMyShow", upi: "bookmyshow@paytm", avatar: "🎟️", category: "Entertainment" },
    { name: "Netflix India", upi: "netflix.in@okhdfc", avatar: "📺", category: "Entertainment" },
    { name: "Spotify Premium", upi: "spotify@oksbi", avatar: "🎵", category: "Entertainment" }
];

// Screen Navigation with Animation
function switchScreen(screenId) {
    const screens = document.querySelectorAll('.upi-screen');
    const targetScreen = document.getElementById(screenId);

    if (!targetScreen) return;

    // Fade out active screens
    screens.forEach(screen => {
        if (screen.classList.contains('active')) {
            screen.style.opacity = '0';
            screen.style.transform = 'translateY(10px)';
            setTimeout(() => {
                screen.classList.remove('active');
                screen.style.display = 'none';
            }, 300);
        }
    });

    // Fade in target screen
    setTimeout(() => {
        targetScreen.style.display = 'flex';
        targetScreen.classList.add('active');
        // trigger reflow
        targetScreen.offsetHeight;
        targetScreen.style.opacity = '1';
        targetScreen.style.transform = 'translateY(0)';
    }, 350);
}

function goToHome(e) {
    if (e) e.preventDefault(); // Prevent jump to top
    switchScreen('homeScreen');
    fetchUserData();
}

/** 
 * INTERACTIVE GPAY FUNCTIONS 
 */

// Show History
async function showTransactionHistory() {
    try {
        const response = await fetch(`${API_BASE}/transactions`);
        const result = await response.json();
        if (result.success) {
            let historyHTML = `
                <div class="history-container" style="padding: 1.5rem; background:white; min-height:100%;">
                    <div style="display:flex; align-items:center; gap: 1rem; margin-bottom: 2rem;">
                        <button id="closeHist" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">←</button>
                        <h3 style="margin:0; font-family:'Outfit';">History</h3>
                    </div>
                    <div class="history-list">
                        ${result.data.map(t => `
                            <div class="history-item" style="display:flex; justify-content:space-between; align-items:center; padding: 1.2rem 0; border-bottom:1px solid #f1f3f4; animation: fadeInUp 0.4s ease forwards">
                                <div style="display:flex; gap:1rem; align-items:center;">
                                    <div style="width:44px; height:44px; border-radius:50%; background:${t.color}15; display:flex; align-items:center; justify-content:center; font-size:1.3rem;">${t.icon}</div>
                                    <div>
                                        <div style="font-weight:600; color:#202124; font-size:0.95rem;">${t.name}</div>
                                        <div style="font-size:0.75rem; color:#5f6368;">${t.time}</div>
                                    </div>
                                </div>
                                <div style="font-weight:700; color:#202124;">₹${t.amount}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            const overlay = document.createElement('div');
            overlay.id = "historyOverlay";
            overlay.className = "upi-screen active";
            overlay.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; background:white; z-index:1000; opacity:1; transform:none; display:block;";
            overlay.innerHTML = historyHTML;
            document.getElementById('phoneScreen').appendChild(overlay);
            overlay.querySelector('#closeHist').onclick = () => overlay.remove();
        }
    } catch (e) { console.error(e); }
}

async function checkBankBalance() {
    try {
        const response = await fetch(`${API_BASE}/user`);
        const result = await response.json();
        if (result.success) {
            alert(`Account Balance\n\n${result.data.upiId}\n₹ ${result.data.balance.toLocaleString('en-IN')}`);
        }
    } catch (e) { alert("Unable to fetch balance"); }
}

function featureComingSoon(name) {
    const toast = document.createElement('div');
    toast.style.cssText = "position:absolute; bottom:80px; left:50%; transform:translateX(-50%); background:#323232; color:white; padding:10px 20px; border-radius:30px; font-size:0.85rem; z-index:2000; animation:fadeInOut 2.5s forwards; box-shadow: 0 4px 12px rgba(0,0,0,0.2);";
    toast.textContent = `${name} coming soon!`;
    document.getElementById('phoneScreen').appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Notification Logic
function showNotifications() {
    switchScreen('notificationScreen');
}

// Features Tab Logic
window.switchFeatureTab = function (type, btn) {
    document.querySelectorAll('.feature-tab').forEach(b => {
        b.style.background = 'white';
        b.style.color = '#64748b';
        b.style.border = '1px solid #e2e8f0';
    });
    btn.style.background = '#6366f1';
    btn.style.color = 'white';
    btn.style.border = 'none';

    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(c => c.style.display = 'none');

    const targetCards = document.querySelectorAll(`.${type}-feat`);
    targetCards.forEach(c => {
        c.style.display = 'flex';
        c.classList.remove('revealed');
        setTimeout(() => c.classList.add('revealed'), 50);
    });
};

/**
 * PAYMENT & SCANNING - FIXED CATEGORY SELECTION
 */
async function processPayment() {
    const amount = document.getElementById('amountInput')?.value || '0';

    // GET SELECTED CATEGORY FROM ACTIVE BUTTON
    const activeCategoryBtn = document.querySelector('.category-btn-emoji.active');
    const selectedCategory = activeCategoryBtn?.dataset.category || currentMerchant?.category || 'Food';

    if (!amount || parseFloat(amount) <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    switchScreen('processingScreen');
    const merchant = document.getElementById('merchant-name')?.textContent || "Merchant";

    try {
        const response = await fetch(`${API_BASE}/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                merchant,
                amount: parseFloat(amount),
                category: selectedCategory // Use the SELECTED category, not merchant default
            })
        });
        const result = await response.json();

        if (result.success) {
            setTimeout(() => {
                document.querySelector('.success-amount').textContent = `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                document.querySelector('.success-merchant').textContent = `Paid to ${merchant}`;

                const details = {
                    'Transaction ID': result.transactionId,
                    'Date & Time': new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
                    'UPI Ref ID': 'UPI' + Math.floor(Math.random() * 100000000000),
                    'Merchant': merchant,
                    'Category': selectedCategory
                };

                document.querySelector('.transaction-details').innerHTML = Object.entries(details).map(([k, v]) => `
                    <div class="detail-row"><span>${k}</span><span>${v}</span></div>
                `).join('');

                const logHint = document.querySelector('.expense-tracked-card p');
                if (logHint) logHint.innerHTML = `Category: <strong>${selectedCategory}</strong> • Auto-Logged`;

                const budgetInfo = document.querySelector('.budget-info');
                if (budgetInfo) {
                    // Mock value for demo visual consistency
                    const mockRemaining = Math.floor(Math.random() * 3000) + 500;
                    budgetInfo.textContent = `₹${mockRemaining.toLocaleString('en-IN')} remaining in ${selectedCategory} budget`;
                }

                switchScreen('successScreen');
                initDashboard();
            }, 1000);
        }
    } catch (e) {
        console.error('Payment failed:', e);
        goToHome();
    }
}

async function simulateScan() {
    const qr = document.getElementById('qrCode');
    if (!qr) return;
    qr.classList.add('scanning');

    try {
        const r = await fetch(`${API_BASE}/scan`, { method: 'POST' });
        const res = await r.json();
        if (res.success) {
            currentMerchant = res.data; // Store current merchant
            const m = res.data;
            document.getElementById('merchant-name').textContent = m.name;
            document.getElementById('merchant-upi').textContent = m.upi;
            document.getElementById('merchant-avatar').textContent = m.avatar;

            // Set default category but allow user override
            document.querySelectorAll('.category-btn-emoji').forEach(b => {
                b.classList.toggle('active', b.dataset.category === m.category);
            });
        }
    } catch (e) {
        console.error('Scan failed:', e);
    }

    setTimeout(() => {
        qr.classList.remove('scanning');
        qr.classList.add('scanned');
        setTimeout(() => switchScreen('paymentScreen'), 600);
    }, 1500);
}

function startQRScan() {
    switchScreen('qrScreen');
}

/**
 * DASHBOARD & ANALYTICS - REDIRECTS TO MAIN DASHBOARD SECTION
 */
async function initDashboard() {
    try {
        const r = await fetch(`${API_BASE}/analytics`);
        const json = await r.json();
        if (json.success) {
            const s = json.data.summary;
            document.getElementById('summary-total-spent').textContent = `₹${s.totalSpent.toLocaleString('en-IN')}`;
            document.getElementById('summary-budget-remaining').textContent = `₹${s.budgetRemaining.toLocaleString('en-IN')}`;
            document.getElementById('summary-txn-count').textContent = s.txnCount;
            document.getElementById('summary-top-category').textContent = `${getCategoryIcon(s.topCategory)} ${s.topCategory}`;

            createCategoryChart(json.data.categoryData);
            createTrendChart(json.data.trendData);
        }

        const txR = await fetch(`${API_BASE}/transactions`);
        const txJson = await txR.json();
        if (txJson.success) populateDashboardTransactions(txJson.data);
    } catch (e) {
        console.error('Dashboard init failed:', e);
    }
}

function populateDashboardTransactions(txns) {
    const container = document.getElementById('transactionsList');
    if (!container) return;
    container.innerHTML = txns.map(t => `
        <div class="transaction-item" style="animation: fadeInUp 0.5s ease forwards">
            <div class="transaction-info">
                <div class="transaction-icon" style="background: ${t.color}15; color: ${t.color};">${t.icon}</div>
                <div class="transaction-details">
                    <h4>${t.name}</h4>
                    <p>${t.time}</p>
                </div>
            </div>
            <div class="transaction-amount">
                <div class="amount">₹${t.amount.toLocaleString('en-IN')}</div>
                <span class="category-badge" style="background:${t.color}10; color:${t.color}">${t.category}</span>
            </div>
        </div>
    `).join('');
}

function getCategoryIcon(c) {
    const icons = {
        'Food': '🍕',
        'Transport': '🚗',
        'Shopping': '🛍️',
        'Bills': '⚡',
        'Entertainment': '🎬',
        'Health': '💊'
    };
    return icons[c] || '💰';
}

/**
 * UTILS & INITIALIZATION
 */
function createCategoryChart(data) {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const total = data.reduce((s, i) => s + i.amount, 0);
    let startAng = -0.5 * Math.PI;
    const cx = w / 2, cy = h / 2, r = Math.min(cx, cy) - 40;
    data.forEach(item => {
        const slice = (item.amount / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAng, startAng + slice);
        ctx.lineTo(cx, cy);
        ctx.fillStyle = item.color;
        ctx.fill();
        startAng += slice;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.65, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
}

function createTrendChart(data) {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    data.forEach((v, i) => {
        const x = (w / (data.length - 1)) * i, y = h - (v / 4000) * h;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
}

async function fetchUserData() {
    try {
        const r = await fetch(`${API_BASE}/user`);
        const json = await r.json();
        if (json.success) {
            document.querySelectorAll('.balance-amount').forEach(el =>
                el.textContent = `₹${json.data.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            );
            document.querySelector('.gpay-profile').textContent = json.data.name.charAt(0);
        }
    } catch (e) {
        console.error('Failed to fetch user data:', e);
    }
}

// CATEGORY SELECTION FIX - Allow manual override
function setupCategoryButtons() {
    document.querySelectorAll('.category-btn-emoji').forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active from all
            document.querySelectorAll('.category-btn-emoji').forEach(b => b.classList.remove('active'));
            // Add active to clicked
            this.classList.add('active');

            // Add visual feedback
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchUserData();
    initDashboard();
    setupCategoryButtons(); // Initialize category button listeners

    // Listeners for GPay grid
    document.querySelectorAll('.gpay-action-btn:not([onclick])').forEach(btn => {
        btn.onclick = () => featureComingSoon(btn.querySelector('span').textContent);
    });

    // Wire up search
    const searchBar = document.querySelector('.gpay-search-placeholder');
    if (searchBar) {
        searchBar.onclick = () => {
            const q = prompt("Search Contacts or Businesses:");
            if (q) featureComingSoon(`Search for "${q}"`);
        };
    }

    const histBtn = document.querySelector('.gpay-footer-item');
    if (histBtn) histBtn.onclick = showTransactionHistory;

    // Scroll reveal
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section, .feature-card, .problem-card, .privacy-card').forEach(el => {
        el.classList.add('reveal-on-scroll');
        revealObserver.observe(el);
    });

    // Dashboard Extras
    document.querySelectorAll('.chart-filter').forEach(s =>
        s.onchange = () => featureComingSoon(`Filtering by ${s.value}`)
    );

    if (document.querySelector('.export-btn')) {
        document.querySelector('.export-btn').onclick = () => {
            alert("Exporting data...");
            setTimeout(() => {
                const a = document.createElement('a');
                a.href = 'data:text/csv;charset=utf-8,Date,Merchant,Amount\n2026-02-04,Pizza Paradise,450.00';
                a.download = 'SBETS_Report.csv';
                a.click();
            }, 1000);
        };
    }

    // Success screen "View Analytics" button redirects to main dashboard
    const viewAnalyticsBtn = document.querySelector('.success-btn.primary');
    if (viewAnalyticsBtn) {
        viewAnalyticsBtn.onclick = function () {
            // Scroll to the main dashboard section on the page
            const dashboardSection = document.getElementById('dashboard');
            if (dashboardSection) {
                dashboardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };
    }
});

function showDashboard() {
    document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
}

function scrollToDemo() {
    document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

function startTestFeatureFlow() {
    scrollToDemo();
    setTimeout(startQRScan, 800);
}

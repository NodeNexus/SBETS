// API Configuration
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

// Global State
let userData = null;
let transactionsData = [];
let analyticsData = null;

// Screen Navigation with Animation
function switchScreen(screenId) {
    const screens = document.querySelectorAll('.upi-screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
        screen.style.opacity = '0';
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        setTimeout(() => {
            targetScreen.classList.add('active');
            setTimeout(() => {
                targetScreen.style.opacity = '1';
            }, 50);
        }, 300);
    }
}

function goToHome() {
    switchScreen('homeScreen');
    setTimeout(() => {
        fetchUserData();
        fetchTransactions();
    }, 300);
}

// Test Feature Flow
function startTestFeatureFlow() {
    scrollToDemo();
    setTimeout(() => {
        startQRScan();
    }, 500);
}

function startQRScan() {
    switchScreen('qrScreen');
    // Animate QR code appearance
    setTimeout(() => {
        const qr = document.getElementById('qrCode');
        if (qr) {
            qr.classList.add('visible');
        }
    }, 400);
}

function simulateScan() {
    const qrCode = document.getElementById('qrCode');
    if (!qrCode) return;

    // Add scanning animation
    qrCode.classList.add('scanning');

    setTimeout(async () => {
        try {
            // Call backend to simulate dynamic scan
            const response = await fetch(`${API_BASE}/scan`, { method: 'POST' });
            const result = await response.json();

            if (result.success) {
                const merchant = result.data;

                // Update interface with scanned merchant
                const nameEl = document.getElementById('merchant-name');
                const upiEl = document.getElementById('merchant-upi');
                const avatarEl = document.getElementById('merchant-avatar');
                if (nameEl) nameEl.textContent = merchant.name;
                if (upiEl) upiEl.textContent = merchant.upi;
                if (avatarEl) avatarEl.textContent = merchant.avatar;

                // Pre-select category if detected
                if (merchant.category) {
                    const btn = document.querySelector(`.category-btn-emoji[data-category="${merchant.category}"]`);
                    if (btn) btn.click();
                }
            }
        } catch (e) {
            console.error("Scan error", e);
        }

        qrCode.classList.remove('scanning');
        qrCode.classList.add('scanned');

        setTimeout(() => {
            qrCode.classList.remove('visible', 'scanned');
            switchScreen('paymentScreen');
        }, 600);
    }, 1500); // 1.5s scan time
}

async function processPayment() {
    const amountInput = document.getElementById('amountInput');
    const amount = amountInput ? amountInput.value : '450';

    const selectedCategory = document.querySelector('.category-btn-new.active, .category-btn-small.active, .category-btn-emoji.active');
    const category = selectedCategory ? selectedCategory.dataset.category || 'food' : 'food';

    if (!amount || parseFloat(amount) <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    switchScreen('processingScreen');

    try {
        const response = await fetch(`${API_BASE}/pay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                merchant: "Pizza Paradise",
                amount: parseFloat(amount),
                category: category
            })
        });

        const result = await response.json();

        if (result.success) {
            // Update Success Screen details
            setTimeout(() => {
                const successAmount = document.querySelector('.success-amount');
                if (successAmount) {
                    successAmount.textContent = `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                }

                const detailsDict = {
                    'Transaction ID': result.transactionId,
                    'Date & Time': new Date().toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                    }),
                    'UPI Ref ID': 'UPI' + Math.floor(Math.random() * 100000000000),
                    'Merchant': 'Pizza Paradise',
                    'Category': category.charAt(0).toUpperCase() + category.slice(1)
                };

                let detailsHTML = '';
                for (const [key, value] of Object.entries(detailsDict)) {
                    detailsHTML += `
                        <div class="detail-row">
                            <span>${key}</span>
                            <span>${value}</span>
                        </div>
                    `;
                }

                const transactionDetails = document.querySelector('.transaction-details');
                if (transactionDetails) {
                    transactionDetails.innerHTML = detailsHTML;
                }

                switchScreen('successScreen');
            }, 1800);
        } else {
            alert("Payment failed: " + (result.message || 'Unknown error'));
            goToHome();
        }

    } catch (error) {
        console.error('Payment error:', error);
        alert("Payment failed. Please check your connection and try again.");
        goToHome();
    }
}







function showDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
            initDashboard();
        }, 500);
    }
}

// Smooth scrolling
function scrollToDemo() {
    const demo = document.getElementById('demo');
    if (demo) {
        demo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function scrollToFeatures() {
    const features = document.getElementById('features');
    if (features) {
        features.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// API Functions
async function fetchUserData() {
    try {
        const response = await fetch(`${API_BASE}/user`);
        const result = await response.json();

        if (result.success) {
            userData = result.data;
            updateUserDisplay();
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

async function fetchTransactions() {
    try {
        const response = await fetch(`${API_BASE}/transactions?limit=10`);
        const result = await response.json();

        if (result.success) {
            transactionsData = result.data;
            // updateRecentTransactions(); // Removed unused function
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

function updateUserDisplay() {
    if (!userData) return;

    // Update balance display
    const balanceElements = document.querySelectorAll('.balance-amount, .user-balance');
    balanceElements.forEach(el => {
        el.textContent = `₹${userData.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    });

    // Update name
    const nameElements = document.querySelectorAll('.user-name');
    nameElements.forEach(el => {
        el.textContent = userData.name;
    });

    // Update UPI ID
    const upiElements = document.querySelectorAll('.upi-id');
    upiElements.forEach(el => {
        el.textContent = userData.upiId;
    });
}



// Dashboard & Charts
async function initDashboard() {
    try {
        const response = await fetch(`${API_BASE}/analytics`);
        const result = await response.json();

        if (result.success) {
            analyticsData = result.data;
            if (result.data.summary) {
                updateDashboardSummary(result.data.summary);
            }
            createCategoryChart(result.data.categoryData);
            createTrendChart(result.data.trendData);
            populateDashboardTransactions(transactionsData);
        }
    } catch (error) {
        console.error('Error fetching analytics:', error);
        // Use fallback data
        createCategoryChart([
            { category: 'Food', amount: 8450, color: '#f59e0b' },
            { category: 'Transport', amount: 5200, color: '#3b82f6' },
            { category: 'Shopping', amount: 6300, color: '#8b5cf6' },
            { category: 'Bills', amount: 3150, color: '#10b981' }
        ]);
        createTrendChart([1200, 1800, 1500, 2200, 1900, 2400, 2100]);
    }
}

function updateDashboardSummary(summary) {
    if (!summary) return;

    // Total Spent
    const totalSpentEl = document.getElementById('summary-total-spent');
    if (totalSpentEl) totalSpentEl.textContent = `₹${summary.totalSpent.toLocaleString('en-IN')}`;

    // Budget Remaining
    const budgetEl = document.getElementById('summary-budget-remaining');
    if (budgetEl) budgetEl.textContent = `₹${summary.budgetRemaining.toLocaleString('en-IN')}`;

    // Txn Count
    const countEl = document.getElementById('summary-txn-count');
    if (countEl) countEl.textContent = summary.txnCount;

    // Top Category
    const topCatEl = document.getElementById('summary-top-category');
    if (topCatEl) topCatEl.textContent = summary.topCategory !== "None" ? `${getCategoryIcon(summary.topCategory)} ${summary.topCategory}` : "None";
}

function getCategoryIcon(category) {
    const icons = { 'Food': '🍔', 'Transport': '🚗', 'Shopping': '🛍️', 'Bills': '⚡', 'Entertainment': '🎬' };
    return icons[category] || '💰';
}

function createCategoryChart(data) {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const total = data.reduce((sum, item) => sum + item.amount, 0);
    let currentAngle = -0.5 * Math.PI;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 60;

    // Draw slices with animation
    data.forEach((item, index) => {
        const sliceAngle = (item.amount / total) * 2 * Math.PI;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = item.color;
        ctx.fill();

        // Add hover effect with shadow
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 0;

        // Labels
        if (item.amount / total > 0.05) {
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelDistance = radius + 35;
            const labelX = centerX + Math.cos(labelAngle) * labelDistance;
            const labelY = centerY + Math.sin(labelAngle) * labelDistance;

            ctx.fillStyle = '#e2e8f0';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.category, labelX, labelY);

            ctx.font = '12px Inter';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`₹${item.amount.toLocaleString('en-IN')}`, labelX, labelY + 18);
        }

        currentAngle += sliceAngle;
    });

    // Draw center circle for doughnut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#151b2e';
    ctx.fill();
}

function createTrendChart(data) {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data) * 1.2;

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        // Y-axis labels
        const value = Math.round(maxValue - (maxValue / 5) * i);
        ctx.fillStyle = '#64748b';
        ctx.font = '11px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(`₹${value}`, padding - 10, y + 4);
    }

    // Draw gradient area
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    ctx.beginPath();
    data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    // Draw points
    data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;

        // Outer circle
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#6366f1';
        ctx.fill();

        // Inner circle
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // X-axis labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x, height - padding + 25);
    });
}

function populateDashboardTransactions(transactions) {
    const container = document.getElementById('transactionsList');
    if (!container || !transactions || transactions.length === 0) return;

    container.innerHTML = transactions.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon" style="background: ${t.color}20; color: ${t.color};">
                    ${t.icon}
                </div>
                <div class="transaction-details">
                    <h4>${t.name}</h4>
                    <p>${t.time}</p>
                </div>
            </div>
            <div class="transaction-amount">
                <div class="amount">₹${t.amount.toLocaleString('en-IN')}</div>
                <span class="category-badge">${t.category}</span>
            </div>
        </div>
    `).join('');
}

// Canvas resize for retina displays
function resizeCanvas(canvas) {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function () {
    // Add Money Logic
    window.addMoney = async function () {
        const amount = prompt("Enter amount to add (₹):");
        if (amount && !isNaN(amount)) {
            try {
                const response = await fetch(`${API_BASE}/add-money`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: parseFloat(amount) })
                });
                const result = await response.json();
                if (result.success) {
                    alert(`Added ₹${amount}. New Balance: ₹${result.newBalance}`);
                    fetchUserData(); // Refresh UI
                }
            } catch (e) {
                alert("Failed to add money");
            }
        }
    };
    // Category Selection Logic
    const categoryBtns = document.querySelectorAll('.category-btn-new, .category-btn-small, .category-btn-emoji');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const siblings = this.parentElement.querySelectorAll('button');
            siblings.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Amount input handling
    const amountInput = document.getElementById('amountInput');
    // payAmount logic removed as element does not exist

    // Initialize canvas elements
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(resizeCanvas);

    // Initial Data Load
    fetchUserData();
    fetchTransactions();

    // Load dashboard if visible
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initDashboard();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(dashboard);
    }

    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });
});

// Handle window resize
window.addEventListener('resize', function () {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        resizeCanvas(canvas);
    });

    // Redraw charts
    if (analyticsData) {
        createCategoryChart(analyticsData.categoryData);
        createTrendChart(analyticsData.trendData);
    }
});

// Add smooth transitions to elements as they enter viewport
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all animatable elements
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .problem-card, .privacy-card, .flow-step');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

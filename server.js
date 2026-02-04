const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Mock Data
let userData = {
    name: "Rahul Sharma",
    upiId: "rahul.sharma@okicici",
    balance: 12450.00,
    budget: 45000.00
};

// ENHANCED: 20 Diverse Merchants for Randomization
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

let transactions = [
    { name: "Blue Tokai Coffee", time: "Just now", amount: 240, icon: "☕", color: "#f59e0b", category: "Food" },
    { name: "Uber Ride", time: "2 hours ago", amount: 180, icon: "🚗", color: "#3b82f6", category: "Transport" },
    { name: "Amazon Prime", time: "Today, 10:00 AM", amount: 1499, icon: "📦", color: "#8b5cf6", category: "Shopping" },
    { name: "MSEB Electric Bill", time: "Yesterday", amount: 2450, icon: "⚡", color: "#10b981", category: "Bills" },
    { name: "PVR Cinemas", time: "Yesterday", amount: 650, icon: "🎬", color: "#ec4899", category: "Entertainment" },
    { name: "Domino's Pizza", time: "Feb 2", amount: 450, icon: "🍕", color: "#f59e0b", category: "Food" },
    { name: "Flipkart", time: "Feb 1", amount: 1250, icon: "🛒", color: "#8b5cf6", category: "Shopping" }
];

// API Routes
app.get('/api/user', (req, res) => {
    res.json({ success: true, data: userData });
});

app.get('/api/transactions', (req, res) => {
    res.json({ success: true, data: transactions });
});

app.get('/api/analytics', (req, res) => {
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = userData.budget - totalSpent;

    const catTotals = {};
    transactions.forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });

    res.json({
        success: true,
        data: {
            summary: {
                totalSpent: totalSpent,
                budgetRemaining: remaining,
                txnCount: transactions.length,
                topCategory: Object.keys(catTotals).reduce((a, b) => catTotals[a] > catTotals[b] ? a : b, "None")
            },
            categoryData: Object.keys(catTotals).map(cat => ({
                category: cat,
                amount: catTotals[cat],
                color: getCategoryColor(cat)
            })),
            trendData: [2100, 1800, 2500, 2200, 2800, 2400, totalSpent / 15]
        }
    });
});

// ENHANCED: Random merchant selection from 20-merchant pool
app.post('/api/scan', (req, res) => {
    const randomMerchant = MERCHANTS_POOL[Math.floor(Math.random() * MERCHANTS_POOL.length)];
    setTimeout(() => {
        res.json({ success: true, data: randomMerchant });
    }, 800);
});

// ENHANCED: Payment now accepts USER-SELECTED category (fixing the cab->food bug)
app.post('/api/pay', (req, res) => {
    const { merchant, amount, category } = req.body;
    
    setTimeout(() => {
        const newTransaction = {
            name: merchant || "Anonymous Merchant",
            time: "Just now",
            amount: parseFloat(amount),
            icon: getCategoryIcon(category), // Use the category the user selected
            color: getCategoryColor(category),
            category: category // Not the merchant's default, but user's choice
        };
        
        transactions.unshift(newTransaction);
        userData.balance -= parseFloat(amount);
        
        res.json({ 
            success: true, 
            transactionId: "TX" + Date.now(),
            category: category // Send back what category was logged
        });
    }, 1500);
});

app.post('/api/add-money', (req, res) => {
    const { amount } = req.body;
    userData.balance += parseFloat(amount);
    res.json({ success: true, newBalance: userData.balance });
});

function getCategoryIcon(category) {
    const icons = { 
        'Food': '🍕', 
        'Transport': '🚗', 
        'Shopping': '🛍️', 
        'Bills': '⚡', 
        'Entertainment': '🎬', 
        'Health': '💊',
        'Travel': '✈️' // Added Travel
    };
    return icons[category] || '💰';
}

function getCategoryColor(category) {
    const colors = { 
        'Food': '#f59e0b', 
        'Transport': '#3b82f6', 
        'Shopping': '#8b5cf6', 
        'Bills': '#10b981', 
        'Entertainment': '#ec4899', 
        'Health': '#ef4444',
        'Travel': '#06b6d4' // Added Travel color
    };
    return colors[category] || '#64748b';
}

app.listen(PORT, () => console.log(`🚀 SBETS Server running at http://localhost:${PORT}`));

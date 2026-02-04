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

let transactions = [
    { name: "Blue Tokai Coffee", time: "Just now", amount: 240, icon: "☕", color: "#f59e0b", category: "Food" },
    { name: "Uber Ride", time: "2 hours ago", amount: 180, icon: "🚗", color: "#3b82f6", category: "Transport" },
    { name: "Amazon Prime", time: "Today, 10:00 AM", amount: 1499, icon: "🛍️", color: "#8b5cf6", category: "Shopping" },
    { name: "MSEB Electric Bill", time: "Yesterday", amount: 2450, icon: "⚡", color: "#10b981", category: "Bills" },
    { name: "PVR Cinemas", time: "Yesterday", amount: 650, icon: "🍿", color: "#ec4899", category: "Entertainment" },
    { name: "Zomato - Pizza", time: "Feb 2", amount: 450, icon: "🍕", color: "#f59e0b", category: "Food" },
    { name: "BigBasket Store", time: "Feb 1", amount: 1250, icon: "🛍️", color: "#8b5cf6", category: "Shopping" }
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

app.post('/api/scan', (req, res) => {
    const merchants = [
        { name: "Blue Tokai Coffee", upi: "bluetokai@okaxis", avatar: "☕", category: "Food" },
        { name: "Apollo Pharmacy", upi: "apollo.india@okhdfc", avatar: "💊", category: "Health" },
        { name: "Uber India", upi: "uber.trip@okaxis", avatar: "🚗", category: "Transport" },
        { name: "H&M Retail", upi: "hm.fashion@oksbi", avatar: "👕", category: "Shopping" }
    ];
    setTimeout(() => res.json({ success: true, data: merchants[Math.floor(Math.random() * merchants.length)] }), 800);
});

app.post('/api/pay', (req, res) => {
    const { merchant, amount, category } = req.body;
    setTimeout(() => {
        const newTransaction = {
            name: merchant || "Anonymous Merchant",
            time: "Just now",
            amount: parseFloat(amount),
            icon: getCategoryIcon(category),
            color: getCategoryColor(category),
            category: category
        };
        transactions.unshift(newTransaction);
        userData.balance -= parseFloat(amount);
        res.json({ success: true, transactionId: "TX" + Date.now() });
    }, 1500);
});

app.post('/api/add-money', (req, res) => {
    const { amount } = req.body;
    userData.balance += parseFloat(amount);
    res.json({ success: true, newBalance: userData.balance });
});

function getCategoryIcon(category) {
    const icons = { 'Food': '🍕', 'Transport': '🚗', 'Shopping': '🛍️', 'Bills': '⚡', 'Entertainment': '🎬', 'Health': '💊' };
    return icons[category] || '💰';
}

function getCategoryColor(category) {
    const colors = { 'Food': '#f59e0b', 'Transport': '#3b82f6', 'Shopping': '#8b5cf6', 'Bills': '#10b981', 'Entertainment': '#ec4899', 'Health': '#ef4444' };
    return colors[category] || '#64748b';
}

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

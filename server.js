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
const userData = {
    name: "Rahul Sharma",
    upiId: "rahul.sharma@okicici",
    balance: 12450.00
};

let transactions = [
    { name: "Pizza Paradise", time: "Just now", amount: 450, icon: "🍕", color: "#f59e0b", category: "Food" },
    { name: "Uber Ride", time: "Today, 9:00 AM", amount: 180, icon: "🚗", color: "#3b82f6", category: "Transport" },
    { name: "Amazon India", time: "Yesterday", amount: 1250, icon: "🛍️", color: "#8b5cf6", category: "Shopping" },
    { name: "MSEB Bill", time: "Yesterday", amount: 850, icon: "⚡", color: "#10b981", category: "Bills" }
];

// API Routes
app.get('/api/user', (req, res) => {
    res.json({ success: true, data: userData });
});

app.get('/api/transactions', (req, res) => {
    res.json({ success: true, data: transactions });
});

app.get('/api/analytics', (req, res) => {
    // dynamically calculate summary
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const budgetTotal = 40000;
    const remaining = budgetTotal - totalSpent;

    // Find top category
    const catTotals = {};
    transactions.forEach(t => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });
    let topCategory = "None";
    let topCatAmount = 0;
    for (const [cat, amt] of Object.entries(catTotals)) {
        if (amt > topCatAmount) {
            topCatAmount = amt;
            topCategory = cat;
        }
    }

    res.json({
        success: true,
        data: {
            summary: {
                totalSpent: totalSpent,
                budgetRemaining: remaining,
                txnCount: transactions.length,
                topCategory: topCategory,
                topCatAmount: topCatAmount
            },
            categoryData: [
                { category: 'Food', amount: catTotals['Food'] || 0, color: '#f59e0b' },
                { category: 'Transport', amount: catTotals['Transport'] || 0, color: '#3b82f6' },
                { category: 'Shopping', amount: catTotals['Shopping'] || 0, color: '#8b5cf6' },
                { category: 'Bills', amount: catTotals['Bills'] || 0, color: '#10b981' }
            ],
            trendData: [1200, 1800, 1500, 2200, 1900, 2400, 2100] // Mock trend data
        }
    });
});

app.post('/api/scan', (req, res) => {
    // Simulate QR resolution
    setTimeout(() => {
        // Return a random merchant
        const merchants = [
            { name: "Pizza Paradise", upi: "pizza.paradise@okicici", avatar: "🍕", category: "Food" },
            { name: "Starbucks", upi: "starbucks.store@okhdfc", avatar: "☕", category: "Food" },
            { name: "Uber", upi: "uber.india@okaxis", avatar: "🚗", category: "Transport" },
            { name: "D-Mart", upi: "dmart.retail@oksbi", avatar: "🛒", category: "Shopping" }
        ];
        const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];

        res.json({
            success: true,
            data: randomMerchant
        });
    }, 800);
});

app.post('/api/add-money', (req, res) => {
    const { amount } = req.body;
    if (amount && amount > 0) {
        userData.balance += parseFloat(amount);
        res.json({ success: true, newBalance: userData.balance });
    } else {
        res.status(400).json({ success: false, message: "Invalid amount" });
    }
});

app.post('/api/pay', (req, res) => {
    const { merchant, amount, category } = req.body;

    // Simulate processing
    setTimeout(() => {
        const newTransaction = {
            name: merchant || "Unknown Merchant",
            time: "Just now",
            amount: amount,
            icon: getCategoryIcon(category),
            color: getCategoryColor(category),
            category: category
        };

        transactions.unshift(newTransaction);
        userData.balance -= amount;

        res.json({
            success: true,
            transactionId: "T" + Date.now(),
            message: "Payment successful"
        });
    }, 1000);
});

// Helper functions
function getCategoryIcon(category) {
    const icons = {
        'Food': '🍕',
        'Transport': '🚗',
        'Shopping': '🛍️',
        'Bills': '⚡',
        'Entertainment': '🎬'
    };
    return icons[category] || '💰';
}

function getCategoryColor(category) {
    const colors = {
        'Food': '#f59e0b',
        'Transport': '#3b82f6',
        'Shopping': '#8b5cf6',
        'Bills': '#10b981',
        'Entertainment': '#ec4899'
    };
    return colors[category] || '#64748b';
}

// Fallback for SPA (though this is single page)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

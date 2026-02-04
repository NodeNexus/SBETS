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
    res.json({
        success: true,
        data: {
            categoryData: [
                { category: 'Food', amount: 8450, color: '#f59e0b' },
                { category: 'Transport', amount: 5200, color: '#3b82f6' },
                { category: 'Shopping', amount: 6300, color: '#8b5cf6' },
                { category: 'Bills', amount: 3150, color: '#10b981' }
            ],
            trendData: [1200, 1800, 1500, 2200, 1900, 2400, 2100]
        }
    });
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

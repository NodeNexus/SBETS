import time
import random
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder='.', static_url_path='')

# Mock Data
user_data = {
    "name": "Rahul Sharma",
    "upiId": "rahul.sharma@okicici",
    "balance": 12450.00,
    "budget": 45000.00
}

MERCHANTS_POOL = [
    { "name": "Blue Tokai Coffee", "upi": "bluetokai@okaxis", "avatar": "☕", "category": "Food" },
    { "name": "Domino's Pizza", "upi": "dominos@okicici", "avatar": "🍕", "category": "Food" },
    { "name": "McDonald's India", "upi": "mcdonalds@okhdfc", "avatar": "🍔", "category": "Food" },
    { "name": "Starbucks", "upi": "starbucks@paytm", "avatar": "☕", "category": "Food" },
    { "name": "Subway", "upi": "subway.india@oksbi", "avatar": "🥪", "category": "Food" },
    
    { "name": "Uber Ride", "upi": "uber.trip@okaxis", "avatar": "🚗", "category": "Transport" },
    { "name": "Ola Cabs", "upi": "ola.india@paytm", "avatar": "🚕", "category": "Transport" },
    { "name": "Rapido Bike", "upi": "rapido@okhdfc", "avatar": "🏍️", "category": "Transport" },
    { "name": "Metro Card Recharge", "upi": "metro.delhi@oksbi", "avatar": "🚇", "category": "Transport" },
    
    { "name": "Amazon India", "upi": "amazon.in@okicici", "avatar": "📦", "category": "Shopping" },
    { "name": "Flipkart", "upi": "flipkart@paytm", "avatar": "🛒", "category": "Shopping" },
    { "name": "Myntra Fashion", "upi": "myntra@okaxis", "avatar": "👗", "category": "Shopping" },
    { "name": "Decathlon Sports", "upi": "decathlon@okhdfc", "avatar": "⚽", "category": "Shopping" },
    
    { "name": "MSEB Electric Bill", "upi": "mseb.pay@oksbi", "avatar": "⚡", "category": "Bills" },
    { "name": "Jio Recharge", "upi": "jio.recharge@paytm", "avatar": "📱", "category": "Bills" },
    { "name": "Airtel Postpaid", "upi": "airtel@okaxis", "avatar": "📞", "category": "Bills" },
    
    { "name": "PVR Cinemas", "upi": "pvr.cinemas@okicici", "avatar": "🎬", "category": "Entertainment" },
    { "name": "BookMyShow", "upi": "bookmyshow@paytm", "avatar": "🎟️", "category": "Entertainment" },
    { "name": "Netflix India", "upi": "netflix.in@okhdfc", "avatar": "📺", "category": "Entertainment" },
    { "name": "Spotify Premium", "upi": "spotify@oksbi", "avatar": "🎵", "category": "Entertainment" }
]

transactions = [
    { "name": "Blue Tokai Coffee", "time": "Just now", "amount": 240, "icon": "☕", "color": "#f59e0b", "category": "Food" },
    { "name": "Uber Ride", "time": "2 hours ago", "amount": 180, "icon": "🚗", "color": "#3b82f6", "category": "Transport" },
    { "name": "Amazon Prime", "time": "Today, 10:00 AM", "amount": 1499, "icon": "📦", "color": "#8b5cf6", "category": "Shopping" },
    { "name": "MSEB Electric Bill", "time": "Yesterday", "amount": 2450, "icon": "⚡", "color": "#10b981", "category": "Bills" },
    { "name": "PVR Cinemas", "time": "Yesterday", "amount": 650, "icon": "🎬", "color": "#ec4899", "category": "Entertainment" },
    { "name": "Domino's Pizza", "time": "Feb 2", "amount": 450, "icon": "🍕", "color": "#f59e0b", "category": "Food" },
    { "name": "Flipkart", "time": "Feb 1", "amount": 1250, "icon": "🛒", "color": "#8b5cf6", "category": "Shopping" }
]

def get_category_icon(category):
    icons = { 
        'Food': '🍕', 
        'Transport': '🚗', 
        'Shopping': '🛍️', 
        'Bills': '⚡', 
        'Entertainment': '🎬', 
        'Health': '💊',
        'Travel': '✈️'
    }
    return icons.get(category, '💰')

def get_category_color(category):
    colors = { 
        'Food': '#f59e0b', 
        'Transport': '#3b82f6', 
        'Shopping': '#8b5cf6', 
        'Bills': '#10b981', 
        'Entertainment': '#ec4899', 
        'Health': '#ef4444',
        'Travel': '#06b6d4'
    }
    return colors.get(category, '#64748b')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/user', methods=['GET'])
def get_user():
    return jsonify({ "success": True, "data": user_data })

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    return jsonify({ "success": True, "data": transactions })

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    total_spent = sum(t['amount'] for t in transactions)
    remaining = user_data['budget'] - total_spent
    
    cat_totals = {}
    for t in transactions:
        cat_totals[t['category']] = cat_totals.get(t['category'], 0) + t['amount']
        
    # Find top category
    top_category = "None"
    if cat_totals:
        top_category = max(cat_totals, key=cat_totals.get)
        
    category_data = []
    for cat, amount in cat_totals.items():
        category_data.append({
            "category": cat,
            "amount": amount,
            "color": get_category_color(cat)
        })
        
    # Mock trend data based on logic in original server.js
    trend_data = [2100, 1800, 2500, 2200, 2800, 2400, total_spent / 15]

    return jsonify({
        "success": True,
        "data": {
            "summary": {
                "totalSpent": total_spent,
                "budgetRemaining": remaining,
                "txnCount": len(transactions),
                "topCategory": top_category
            },
            "categoryData": category_data,
            "trendData": trend_data
        }
    })

@app.route('/api/scan', methods=['POST'])
def scan_qr():
    random_merchant = random.choice(MERCHANTS_POOL)
    time.sleep(0.8) # Simulate delay
    return jsonify({ "success": True, "data": random_merchant })

@app.route('/api/pay', methods=['POST'])
def pay_bill():
    data = request.json
    merchant = data.get('merchant', "Anonymous Merchant")
    amount = float(data.get('amount', 0))
    category = data.get('category', 'Food')
    
    time.sleep(1.5) # Simulate delay
    
    new_transaction = {
        "name": merchant,
        "time": "Just now",
        "amount": amount,
        "icon": get_category_icon(category),
        "color": get_category_color(category),
        "category": category
    }
    
    transactions.insert(0, new_transaction)
    user_data['balance'] -= amount
    
    return jsonify({
        "success": True,
        "transactionId": "TX" + str(int(time.time() * 1000)),
        "category": category
    })

@app.route('/api/add-money', methods=['POST'])
def add_money():
    data = request.json
    amount = float(data.get('amount', 0))
    user_data['balance'] += amount
    return jsonify({ "success": True, "newBalance": user_data['balance'] })

if __name__ == '__main__':
    print("🚀 SBETS Server running at http://localhost:3000")
    app.run(port=3000, debug=True)

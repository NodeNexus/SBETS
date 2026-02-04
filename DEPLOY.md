# Deployment Instructions for Render

Your SBETS UPI Demo is now ready for deployment! I have converted it into a Node.js web application so the API calls (Payment, Analytics, User Data) will work perfectly in the live demo.

## Deployment Steps

1.  **Push to GitHub**
    *   Initialize a git repository if you haven't already:
        ```bash
        git init
        git add .
        git commit -m "Initial commit for Render deployment"
        ```
    *   Create a new repository on GitHub and push your code there.

2.  **Deploy on Render**
    *   Log in to [Render.com](https://render.com).
    *   Click **New +** and select **Web Service**.
    *   Connect your GitHub account and select your repository.
    *   **Configure the service:**
        *   **Name:** `sbets-upi-demo` (or any name you like)
        *   **Runtime:** `Node` (It should detect this automatically)
        *   **Build Command:** `npm install`
        *   **Start Command:** `node server.js`
    *   Click **Create Web Service**.

## What I Added
*   `package.json`: Defines the project as a Node.js app and lists dependencies (`express`).
*   `server.js`: A lightweight web server that:
    *   Serves your `index.html`, `styles.css`, and `script.js`.
    *   **Mocks the API**: It simulates the backend for `/api/pay`, `/api/user`, etc., so your "Pay Now" button and Charts actually work in the demo!

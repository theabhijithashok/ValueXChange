# ValueXchange Firebase Deployment Guide

This guide will help you deploy your ValueXchange application to Firebase.

## Architecture

- **Frontend**: React + Vite → Firebase Hosting
- **Backend**: Express + MongoDB → Cloud hosting (Render/Railway recommended)
- **Database**: MongoDB Atlas (already configured)
- **Storage**: Firebase Storage (already configured)

---

## Prerequisites

1. **Firebase CLI** installed globally
2. **Node.js** and **npm** installed
3. **Firebase project** created (you already have: `valuexchange-25892`)

---

## Step 1: Install Firebase CLI

If you haven't already installed the Firebase CLI:

```bash
npm install -g firebase-tools
```

Verify installation:

```bash
firebase --version
```

---

## Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window for authentication.

---

## Step 3: Build Your Frontend

Navigate to the frontend directory and build the production bundle:

```bash
cd frontend
npm install
npm run build
```

This creates an optimized production build in `frontend/dist/`.

---

## Step 4: Deploy Frontend to Firebase Hosting

From the **root directory** of your project:

```bash
firebase deploy --only hosting
```

Your frontend will be deployed to: `https://valuexchange-25892.web.app`

---

## Step 5: Backend Deployment Options

Since Firebase Cloud Functions has limitations with Express apps and MongoDB, I recommend deploying your backend separately.

### **Option A: Deploy to Render (Recommended)** ✅

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service**:
   - Connect your GitHub repository
   - Set **Root Directory**: `backend`
   - Set **Build Command**: `npm install`
   - Set **Start Command**: `npm start`
   - Set **Environment**: Node

3. **Add Environment Variables** in Render dashboard:
   ```
   MONGODB_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<your-jwt-secret>
   PORT=10000
   FRONTEND_URL=https://valuexchange-25892.web.app
   GOOGLE_CLIENT_ID=<your-google-client-id>
   ```

4. **Deploy** - Render will automatically deploy your backend

5. **Get your backend URL**: `https://your-app-name.onrender.com`

### **Option B: Deploy to Railway**

1. Go to [railway.app](https://railway.app)
2. Create a new project from GitHub repo
3. Select the `backend` folder
4. Add environment variables
5. Deploy

### **Option C: Deploy to Google Cloud Run**

```bash
cd backend
gcloud run deploy valuexchange-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Step 6: Update Frontend API URL

After deploying your backend, update the API URL in your frontend:

**File**: `frontend/src/config.js` or wherever your API base URL is defined

```javascript
// Replace localhost with your deployed backend URL
export const API_BASE_URL = 'https://your-backend-url.onrender.com';
```

Then rebuild and redeploy:

```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

---

## Step 7: Configure CORS

Update your backend CORS configuration to allow requests from your Firebase Hosting domain:

**File**: `backend/server.js` or `backend/middleware/cors.js`

```javascript
const corsOptions = {
  origin: [
    'https://valuexchange-25892.web.app',
    'https://valuexchange-25892.firebaseapp.com',
    'http://localhost:5173' // Keep for local development
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

Redeploy your backend after this change.

---

## Step 8: Update Firebase Security Rules

Ensure your Firestore and Storage rules are production-ready:

### **Firestore Rules** (if using Firestore):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Storage Rules**:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /listings/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /profiles/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

---

## Quick Deployment Commands

### **Deploy Everything**:
```bash
# Build frontend
cd frontend && npm run build && cd ..

# Deploy to Firebase
firebase deploy
```

### **Deploy Only Hosting**:
```bash
firebase deploy --only hosting
```

### **Deploy Only Rules**:
```bash
firebase deploy --only firestore:rules,storage:rules
```

---

## Environment Variables Checklist

### **Backend** (on Render/Railway):
- ✅ `MONGODB_URI`
- ✅ `JWT_SECRET`
- ✅ `PORT`
- ✅ `FRONTEND_URL`
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `FIREBASE_SERVICE_ACCOUNT` (if using Firebase Admin SDK)

### **Frontend** (in `.env` or config):
- ✅ `VITE_API_BASE_URL`
- ✅ `VITE_FIREBASE_API_KEY`
- ✅ `VITE_FIREBASE_AUTH_DOMAIN`
- ✅ `VITE_FIREBASE_PROJECT_ID`
- ✅ `VITE_FIREBASE_STORAGE_BUCKET`
- ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `VITE_FIREBASE_APP_ID`

---

## Troubleshooting

### **Issue**: Frontend can't connect to backend
**Solution**: Check CORS settings and ensure API URL is correct

### **Issue**: Authentication not working
**Solution**: Verify Firebase config and authorized domains in Firebase Console

### **Issue**: Images not uploading
**Solution**: Check Firebase Storage rules and bucket configuration

### **Issue**: Build fails
**Solution**: Run `npm install` in both frontend and backend directories

---

## Monitoring & Logs

- **Frontend logs**: Firebase Console → Hosting
- **Backend logs**: Render/Railway dashboard
- **Database**: MongoDB Atlas dashboard

---

## Custom Domain (Optional)

To use a custom domain like `valuexchange.com`:

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the DNS configuration steps
4. Update CORS and environment variables with new domain

---

## Continuous Deployment (Optional)

### **Using GitHub Actions**:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm install
      
      - name: Build
        run: cd frontend && npm run build
      
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

Generate token:
```bash
firebase login:ci
```

Add the token to GitHub Secrets as `FIREBASE_TOKEN`.

---

## Summary

1. ✅ Build frontend: `cd frontend && npm run build`
2. ✅ Deploy frontend: `firebase deploy --only hosting`
3. ✅ Deploy backend to Render/Railway
4. ✅ Update API URLs in frontend
5. ✅ Configure CORS
6. ✅ Test your application

**Your app will be live at**: `https://valuexchange-25892.web.app`

---

## Need Help?

- Firebase Hosting Docs: https://firebase.google.com/docs/hosting
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app

Good luck with your deployment! 🚀

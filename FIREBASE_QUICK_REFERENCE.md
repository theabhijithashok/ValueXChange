# Firebase Hosting Quick Reference

## 🚀 Quick Deploy

The easiest way to deploy:

```bash
./deploy.sh
```

This script will:
1. Install frontend dependencies
2. Build the production bundle
3. Deploy to Firebase Hosting

---

## 📋 Manual Deployment Steps

### 1. **First Time Setup**

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify your project
firebase projects:list
```

### 2. **Build Frontend**

```bash
cd frontend
npm install
npm run build
cd ..
```

### 3. **Deploy to Firebase**

```bash
firebase deploy --only hosting
```

---

## 🌐 Your URLs

- **Production**: https://valuexchange-25892.web.app
- **Alternative**: https://valuexchange-25892.firebaseapp.com

---

## 🔧 Common Commands

```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Storage rules
firebase deploy --only storage:rules

# Deploy everything
firebase deploy

# Preview locally before deploying
firebase serve
```

---

## ⚠️ Important Notes

1. **Backend is NOT hosted on Firebase** - You need to deploy it separately to:
   - Render (recommended)
   - Railway
   - Google Cloud Run
   - Heroku

2. **After deploying backend**, update the API URL in your frontend and redeploy

3. **CORS Configuration** - Make sure your backend allows requests from:
   - `https://valuexchange-25892.web.app`
   - `https://valuexchange-25892.firebaseapp.com`

---

## 📚 Full Documentation

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

---

## 🐛 Troubleshooting

### Build fails
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase CLI not found
```bash
npm install -g firebase-tools
```

### Not logged in
```bash
firebase login
```

### Wrong project
```bash
firebase use valuexchange-25892
```

---

## 📞 Need Help?

Check the full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions and troubleshooting.

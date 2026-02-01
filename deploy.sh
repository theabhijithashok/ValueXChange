#!/bin/bash

# ValueXchange Deployment Script
# This script builds and deploys your frontend to Firebase Hosting

echo "🚀 Starting ValueXchange Deployment..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI is not installed."
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
echo "📝 Checking Firebase authentication..."
firebase projects:list &> /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Firebase."
    echo "Run: firebase login"
    exit 1
fi

echo "✅ Firebase CLI ready"
echo ""

# Navigate to frontend directory
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Build the frontend
echo "🔨 Building frontend for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Go back to root directory
cd ..

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""
echo "🌐 Your app is live at: https://valuexchange-25892.web.app"
echo ""
echo "📝 Next steps:"
echo "   1. Deploy your backend to Render/Railway (see DEPLOYMENT_GUIDE.md)"
echo "   2. Update API URL in frontend config"
echo "   3. Rebuild and redeploy frontend"
echo ""

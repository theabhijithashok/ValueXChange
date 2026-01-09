import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let serviceAccount;

try {
    // Priority 1: Check if GOOGLE_APPLICATION_CREDENTIALS points to a file
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
    }
    // Priority 2: Check for a local file named 'firebase-service-account.json' in config or root
    else if (fs.existsSync(path.join(__dirname, 'firebase-service-account.json'))) {
        serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-service-account.json'), 'utf8'));
    }
    // Priority 3: Check for environment variables directly (less secure but common for simple hosting)
    else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Handle newlines in private key if they are escaped
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
    }
} catch (error) {
    console.warn("Failed to load Firebase credentials:", error.message);
}

let db;

if (serviceAccount) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        console.log("🔥 Firebase Admin initialized successfully");
    } catch (error) {
        console.error("Firebase Admin initialization failed:", error);
    }
} else {
    console.warn("⚠️ Firebase Admin credentials not found. Firestore sync will be disabled.");
}

export { db, admin };

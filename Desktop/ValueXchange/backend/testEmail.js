import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Testing email configuration...');
console.log('Service:', process.env.EMAIL_SERVICE);
console.log('Username:', process.env.EMAIL_USERNAME);
// Don't log password

const testEmail = async () => {
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
        console.error('ERROR: EMAIL_USERNAME or EMAIL_PASSWORD is missing in .env file');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        console.log('Attempting to send test email to:', process.env.EMAIL_USERNAME);

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USERNAME,
            to: process.env.EMAIL_USERNAME, // Send to self
            subject: 'ValueXchange Email Test',
            text: 'If you see this, your email configuration is working correctly!'
        });

        console.log('SUCCESS: Email sent!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('FAILED: Could not send email.');
        console.error('Error details:', error.message);

        if (error.code === 'EAUTH') {
            console.error('\nPOSSIBLE CAUSES:');
            console.error('1. Incorrect password. Did you use an App Password? (Normal passwords often fail)');
            console.error('2. 2-Factor Authentication is on but you are using your normal password.');
            console.error('3. "Less secure app access" is disabled (which it is for almost everyone now).');
            console.error('\nSOLUTION: Go to your Google Account > Security > App Passwords, generate a new one, and use that.');
        }
    }
};

testEmail();

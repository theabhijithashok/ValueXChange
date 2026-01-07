import dotenv from 'dotenv';

dotenv.config();

console.log('=== Environment Variables Check ===');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('===================================');

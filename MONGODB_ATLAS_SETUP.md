# MongoDB Atlas Setup Guide for ValueXchange

Follow these steps to set up a free MongoDB Atlas cloud database for your ValueXchange application.

## Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up using:
   - Email and password, OR
   - Google account, OR
   - GitHub account
3. Complete the registration and verify your email if required

## Step 2: Create a Free Cluster

1. After logging in, you'll see "Create a deployment" or "Build a Database"
2. Click **"Build a Database"**
3. Choose **"M0 FREE"** tier (this is completely free forever)
   - 512 MB storage
   - Shared RAM
   - Perfect for development and small projects
4. Select your preferred cloud provider:
   - AWS, Google Cloud, or Azure (any works fine)
5. Choose a region **closest to your location** for better performance
   - For India: Choose Mumbai or Singapore
6. Cluster Name: Leave as default or name it `ValueXchange`
7. Click **"Create"** button
8. Wait 1-3 minutes for cluster creation

## Step 3: Create Database User

1. You'll see a "Security Quickstart" screen
2. Under **"How would you like to authenticate your connection?"**
   - Choose **"Username and Password"**
3. Create credentials:
   - **Username**: `valuexchange_user` (or any name you prefer)
   - **Password**: Click "Autogenerate Secure Password" OR create your own
   - **IMPORTANT**: Copy and save this password somewhere safe!
4. Click **"Create User"**

## Step 4: Set Up Network Access

1. Still on the Security Quickstart screen
2. Under **"Where would you like to connect from?"**
   - Click **"My Local Environment"**
3. Add IP Address:
   - Click **"Add My Current IP Address"** (for your current location)
   - OR click **"Add a Different IP Address"** and enter `0.0.0.0/0` (allows access from anywhere - good for development)
4. Click **"Add Entry"**
5. Click **"Finish and Close"**

## Step 5: Get Your Connection String

1. Click **"Go to Databases"** or navigate to "Database" in the left sidebar
2. You should see your cluster (Cluster0 or ValueXchange)
3. Click the **"Connect"** button
4. Choose **"Drivers"** (or "Connect your application")
5. Select:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
6. Copy the connection string - it looks like:
   ```
   mongodb+srv://valuexchange_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your Backend .env File

1. Open `backend/.env` in your ValueXchange project
2. Find the line with `MONGODB_URI`
3. Replace it with your Atlas connection string
4. **IMPORTANT**: Replace `<password>` with your actual database password
5. Add the database name `valuexchange` before the `?` in the URL

**Example:**
```env
# Before (local MongoDB)
MONGODB_URI=mongodb://localhost:27017/valuexchange

# After (MongoDB Atlas)
MONGODB_URI=mongodb+srv://valuexchange_user:YourActualPassword@cluster0.xxxxx.mongodb.net/valuexchange?retryWrites=true&w=majority
```

**Complete .env file should look like:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://valuexchange_user:YourActualPassword@cluster0.xxxxx.mongodb.net/valuexchange?retryWrites=true&w=majority
JWT_SECRET=valuexchange_secret_key_2024_change_in_production
NODE_ENV=development
```

## Step 7: Test the Connection

1. Save the `.env` file
2. Open terminal in the `backend` folder
3. Install dependencies (if not done already):
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
5. Look for the message:
   ```
   ✅ MongoDB connected successfully
   🚀 Server running on port 5000
   ```

## Troubleshooting

### Error: "Authentication failed"
- Double-check your username and password in the connection string
- Make sure you replaced `<password>` with your actual password
- Password should NOT have `<` or `>` symbols

### Error: "Connection timeout" or "Could not connect"
- Check your network access settings in Atlas
- Make sure you added `0.0.0.0/0` or your current IP address
- Check your internet connection

### Error: "MongoServerError: bad auth"
- Your password might contain special characters that need URL encoding
- Try resetting the database user password in Atlas
- Use a simpler password without special characters

### Special Characters in Password
If your password has special characters like `@`, `#`, `$`, etc., you need to URL encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- Or just create a new password without special characters

## Next Steps

Once MongoDB Atlas is connected:

1. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser**:
   - Go to `http://localhost:3000`
   - Register a new account
   - Start using ValueXchange!

## Viewing Your Data in Atlas

1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. You'll see your databases and collections:
   - `valuexchange` database
   - Collections: `users`, `listings`, `bids`
4. You can view, edit, and manage data directly from the Atlas interface

## Free Tier Limits

- **Storage**: 512 MB
- **RAM**: Shared
- **Connections**: Up to 500 concurrent connections
- **No credit card required**
- **Never expires**

This is more than enough for development and testing!

---

**Need Help?** If you encounter any issues, let me know the exact error message and I'll help you troubleshoot!

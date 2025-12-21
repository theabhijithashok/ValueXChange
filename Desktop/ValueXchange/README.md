# ValueXchange - Barter Marketplace

A full-stack barter marketplace application where users can exchange goods, services, and skills without money. Built with React, Tailwind CSS, Node.js, Express.js, and MongoDB.

## Features

- **User Authentication**: Register, login, and secure JWT-based authentication
- **Listing Management**: Create, browse, and manage barter listings
- **Categories**: Organize items by Goods, Services, Skills, or Other
- **Wishlist**: Save favorite listings for later
- **Value Rating**: Rate items based on perceived value
- **Bidding System**: Make offers and negotiate with other users
- **Responsive Design**: Beautiful UI with Tailwind CSS

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- React Router
- Axios
- Vite

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Clone the repository**
```bash
cd ValueXchange
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure Environment Variables**

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/valuexchange
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

### Running the Application

1. **Start MongoDB** (if running locally)
```bash
mongod
```

2. **Start Backend Server**
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

3. **Start Frontend Development Server**
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3000`

4. **Open your browser** and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/wishlist/:listingId` - Add to wishlist
- `DELETE /api/auth/wishlist/:listingId` - Remove from wishlist

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create new listing (auth required)
- `PUT /api/listings/:id` - Update listing (owner only)
- `DELETE /api/listings/:id` - Delete listing (owner only)
- `GET /api/listings/my/listings` - Get user's listings (auth required)

### Bids
- `GET /api/bids/listing/:listingId` - Get bids for a listing
- `GET /api/bids/my/bids` - Get user's bids
- `POST /api/bids` - Create new bid (auth required)
- `PUT /api/bids/:id` - Update bid status (listing owner only)

## Project Structure

```
ValueXchange/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── listingController.js
│   │   └── bidController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Listing.js
│   │   └── Bid.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── listingRoutes.js
│   │   └── bidRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── ListingCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── BrowseListings.jsx
│   │   │   ├── CreateListing.jsx
│   │   │   └── Wishlist.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Usage

1. **Register an account** or **login** if you already have one
2. **Browse listings** to see what others are offering
3. **Create a listing** to offer your goods, services, or skills
4. **Add items to your wishlist** to save them for later
5. **Make bids** on items you're interested in
6. **Negotiate** with other users to complete the barter

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

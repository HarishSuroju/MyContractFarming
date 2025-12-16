# Assured Contract Farming

A MERN stack application for connecting farmers with buyers through smart contracts.

## Project Structure

```
AssuredContractFarming/
├── client/          # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── utils/
│       ├── assets/
│       └── hooks/
├── server/          # Node.js/Express backend
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
└── README.md
```

## Tech Stack

- **Frontend**: React, Axios, React Router
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Deployment**: Vercel (Frontend), Heroku/Docker (Backend)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AssuredContractFarming
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

### Environment Variables

Create `.env` files in both `server` and `client` directories:

**Server (.env)**:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

**Client (.env)**:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Features

- Farmer and buyer registration/authentication
- Smart contract creation and management
- Real-time contract tracking
- Payment processing
- Dashboard for monitoring contracts
- Notifications system

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License.

## Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter) - email@example.com
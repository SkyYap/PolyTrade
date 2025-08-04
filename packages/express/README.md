# Express Server - PolyTrade

A robust Express.js server setup for the PolyTrade project with Supabase integration.

## Features

- ✅ Express.js server with security headers (Helmet)
- ✅ CORS enabled for cross-origin requests
- ✅ Request logging with Morgan
- ✅ Environment variable configuration
- ✅ **Supabase integration** for database operations
- ✅ **Supabase authentication** middleware
- ✅ Error handling middleware (PostgreSQL specific)
- ✅ Async handler wrapper
- ✅ Modular route structure with full CRUD operations
- ✅ Health check endpoint
- ✅ Supabase helper utilities
- ✅ File upload support (Supabase Storage)

## Quick Start

1. **Install dependencies:**
   ```bash
   cd packages/express
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

3. **Start the server:**
   ```bash
   # Development or production mode
   npm run dev
   # or
   npm start
   ```

4. **Test the API:**
   - Health check: `GET http://localhost:5000/health`
   - API root: `GET http://localhost:5000/api`
   - Example endpoint: `GET http://localhost:5000/api/example`

## Project Structure

```
packages/express/
├── index.js                 # Main server file
├── config/
│   └── supabase.js         # Supabase client configuration
├── routes/
│   ├── index.js            # Main router
│   └── example.js          # Example routes with full CRUD
├── controllers/
│   └── exampleController.js # Example controller with Supabase
├── middleware/
│   ├── errorHandler.js     # Global error handler (PostgreSQL)
│   ├── asyncHandler.js     # Async wrapper
│   └── auth.js             # Supabase authentication middleware
├── utils/
│   ├── logger.js           # Custom logger
│   └── supabaseHelpers.js  # Supabase utility functions
├── .env.example            # Environment variables template
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server (same as start)
- `npm test` - Run tests (placeholder)

## API Endpoints

### Base Routes
- `GET /health` - Health check endpoint
- `GET /api` - API information and available endpoints

### Example Routes
- `GET /api/example` - Get example data
- `POST /api/example` - Create example data

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Supabase Service Role Key (for admin operations)
# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CORS Configuration
# ALLOWED_ORIGINS=http://localhost:3001,http://localhost:8080
```

### Getting Supabase Credentials:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the Project URL and anon/public key

## Supabase Setup

### 1. Create Example Table in Supabase
Run this SQL in your Supabase SQL editor:

```sql
-- Create examples table
CREATE TABLE examples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional)
ALTER TABLE examples ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (modify as needed)
CREATE POLICY "Allow all operations on examples" ON examples
  FOR ALL USING (true) WITH CHECK (true);
```

### 2. Using Supabase Helpers
The `utils/supabaseHelpers.js` provides generic functions:

```javascript
const { getAllRecords, createRecord } = require('../utils/supabaseHelpers');

// Get all users with pagination
const users = await getAllRecords('users', {
  page: 1,
  limit: 10,
  orderBy: { column: 'created_at', ascending: false }
});

// Create a new user
const newUser = await createRecord('users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

## Adding New Routes

1. Create a new route file in `routes/` directory
2. Create corresponding controller in `controllers/` directory
3. Import and use in `routes/index.js`

Example with Supabase:
```javascript
// routes/users.js
const express = require('express');
const { getUsers, createUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/').get(getUsers).post(protect, createUser);

module.exports = router;
```

## Error Handling

The server includes global error handling middleware that:
- Catches all unhandled errors
- Provides appropriate HTTP status codes
- Logs errors for debugging
- Returns JSON error responses

## Contributing

1. Follow the existing code structure
2. Use the async handler wrapper for async routes
3. Implement proper error handling
4. Add appropriate logging
5. Update documentation as needed
# EduAI Platform Server

This is the backend server for the EduAI Platform, providing API endpoints for authentication, user management, assignments, and AI-powered educational assistance.

## Prerequisites

- Node.js (v18.16.0 or higher)
- PostgreSQL (v14 or higher)
- Google Cloud Project with Generative AI API enabled

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_SCHEMA=edu_platform
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Initialize the database:
   - Ensure PostgreSQL is running
   - Create a database and schema as specified in your env variables
   - The server will automatically create required tables on startup

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Routes

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/verify` - Verify JWT token

### Admin Routes
- GET `/api/admin/registration-requests` - Get all registration requests
- PUT `/api/admin/registration-requests/:id/approve` - Approve registration
- PUT `/api/admin/registration-requests/:id/reject` - Reject registration
- GET `/api/admin/users` - Get all users
- PUT `/api/admin/users/:id/deactivate` - Deactivate user
- PUT `/api/admin/users/:id/reactivate` - Reactivate user

### Teacher Routes
- GET `/api/teacher/assignments` - Get teacher's assignments
- POST `/api/teacher/assignments` - Create new assignment

### Student Routes
- GET `/api/student/assignments` - Get student's assignments
- PUT `/api/student/assignments/:id/status` - Update assignment status

### AI Routes
- POST `/api/ai/validate` - Validate and process AI requests

## Security Features

- JWT Authentication
- Role-based Access Control
- Rate Limiting
- Request Validation
- Security Headers (Helmet)
- SQL Injection Protection
- CORS Configuration

## Error Handling

The server includes comprehensive error handling with:
- Request Validation
- Database Error Handling
- Authentication/Authorization Errors
- Rate Limit Errors
- General Error Handler

## Logging

- Request/Response Logging
- Error Logging
- Activity Logging for user actions

## Development

### Code Structure
```
server/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── db/            # Database configuration
├── middleware/    # Custom middleware
├── models/        # Database models
├── routes/        # API routes
├── services/      # Business logic
└── utils/         # Utility functions
```

### Adding New Features
1. Create/update database models in `models/`
2. Add business logic in `services/`
3. Create route handlers in `controllers/`
4. Define routes in `routes/`
5. Add validation rules in `middleware/validate.js`
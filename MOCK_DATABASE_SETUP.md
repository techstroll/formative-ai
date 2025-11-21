# Mock Database Setup - No PostgreSQL Required

## Overview

The backend now includes an **in-memory mock database** that stores data during the session. This allows you to test the entire auth flow without needing PostgreSQL installed.

### Features
✅ User registration with password hashing (bcryptjs)
✅ User login with secure password verification
✅ JWT token generation and validation
✅ Persistent token storage in localStorage (frontend)
✅ Auto token validation on app restart
✅ In-memory data persistence (data lost on server restart)

## Current Status

**Running Services:**
- ✅ Backend (Express) on http://localhost:3001
- ✅ Frontend (Next.js) on http://localhost:3000
- ❌ PostgreSQL (not needed - using mock database instead)
- ❌ AI Pipeline (optional - needed only for research generation)

## How It Works

### Backend Changes
1. Created `backend/src/db/mockDatabase.ts` - In-memory database with:
   - User creation with bcryptjs password hashing
   - Email-based user lookup
   - Password verification
   - User ID-based lookup

2. Updated `backend/src/services/authService.ts`:
   - Added `AuthUser` interface for standardized user data
   - Added `useMockDb` flag (set to `true`)
   - Supports both mock database and PostgreSQL (for production)
   - All three auth methods work with mock DB: register, login, getUserById

3. Updated `backend/src/routes/auth.ts`:
   - Removed direct PostgreSQL dependency
   - Uses authService for all user operations
   - All endpoints work with mock database

## Testing the Auth Flow

### 1. Start All Services

```bash
# Terminal 1: Start Backend
cd /Users/nick/Development/formative-ai/backend
npm run dev

# Terminal 2: Start Frontend
cd /Users/nick/Development/formative-ai/frontend
npm run dev
```

Both should be running:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

### 2. Test Signup (Frontend)
1. Open http://localhost:3000/signup
2. Fill in form:
   - **Name**: John Doe
   - **Email**: john@example.com
   - **Password**: securepass123
   - **Confirm**: securepass123
3. Click "Create Account"
4. **Expected**:
   - Success toast notification
   - Redirect to dashboard
   - See "Welcome, John Doe"

### 3. Test Login (Frontend)
1. Open http://localhost:3000/logout (or click logout if on dashboard)
2. Go to http://localhost:3000/login
3. Fill in form:
   - **Email**: john@example.com
   - **Password**: securepass123
4. Click "Sign In"
5. **Expected**:
   - Success toast notification
   - Redirect to dashboard
   - See "Welcome, John Doe"

### 4. Test Protected Routes
1. Log in at http://localhost:3000/login
2. Go to http://localhost:3000/dashboard
   - **Expected**: See dashboard with user greeting
3. Click "New Research"
   - **Expected**: Navigate to /research page
4. Click "Logout" in navbar
   - **Expected**: Redirect to /login

### 5. Test Token Persistence
1. Log in at http://localhost:3000/login
2. Open DevTools > Application > Local Storage > http://localhost:3000
3. See `authToken` key with JWT value
4. Refresh page (Cmd+R / Ctrl+R)
5. **Expected**: Remain logged in, dashboard loads

### 6. Test Invalid Token Cleanup
1. Log in to get token
2. Edit `authToken` in localStorage to invalid value
3. Refresh page
4. **Expected**: Redirect to login (invalid token cleaned up)

## API Endpoint Testing (curl)

### Signup
```bash
curl -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "name": "Test User",
    "password": "testpass123"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "testuser@example.com",
    "name": "Test User",
    "role": "user"
  },
  "token": "jwt-token-string"
}
```

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "testpass123"
  }'
```

### Get Current User (Protected)
```bash
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Limitations

### What Doesn't Work Yet
- ❌ Data persists only during server session (restarting backend clears all users)
- ❌ No database for projects/research artifacts
- ❌ No research generation (requires AI Pipeline + API keys)
- ❌ No email verification
- ❌ No password reset

### What Works Perfectly
- ✅ User signup with validation
- ✅ User login with password verification
- ✅ JWT tokens
- ✅ Protected routes
- ✅ Token persistence
- ✅ Auth UI and forms

## Switching to PostgreSQL Later

When PostgreSQL is available, to enable it:

1. Start PostgreSQL and initialize schema:
```bash
docker-compose up postgres -d
psql -U formative_user -d formative_ai -f database/schema.sql
```

2. Update `backend/src/services/authService.ts`:
```typescript
private useMockDb = false; // Switch to PostgreSQL
```

3. Restart backend
```bash
npm run dev
```

## Files Modified/Created

### Created
- `backend/src/db/mockDatabase.ts` - In-memory database

### Modified
- `backend/src/services/authService.ts` - Dual-mode (mock + PostgreSQL)
- `backend/src/routes/auth.ts` - Removed User import

## Next Steps

1. **Test complete auth flow** with signup/login/protected routes
2. **Set up PostgreSQL** for persistent data (optional)
3. **Configure AI Pipeline** for research generation
4. **Add research endpoint integration** to use real research API
5. **Implement error boundaries** for production readiness

---

**Key Takeaway**: You can now test the entire frontend UI without PostgreSQL. Data persists during the session but is cleared on server restart. This is perfect for development and testing!

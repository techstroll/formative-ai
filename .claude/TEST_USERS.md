# Test Users & Authentication

**Last Updated:** November 19, 2025
**Purpose:** Store test user credentials for development and testing
**Status:** Active - Use these users for manual testing and API testing

---

## 🔐 Test Users

### Primary Test User

| Field | Value |
|-------|-------|
| **Email** | `testuser@example.com` |
| **Password** | `TestPassword123` |
| **Name** | Test User |
| **User ID** | `50b91961-db91-4bf3-9baa-1ed9fe66c0d7` |
| **Role** | user |
| **Status** | ✅ Active & Tested |
| **Created** | Nov 19, 2025 |

**Use Case:** Primary development user for UI testing and API requests

---

## 🔑 JWT Tokens

### Token Generation Command

```bash
# Generate JWT token for testuser@example.com
node -e "
const jwt = require('jsonwebtoken');
const secret = 'your-secret-key-change-in-production';
const token = jwt.sign(
  {
    userId: '50b91961-db91-4bf3-9baa-1ed9fe66c0d7',
    email: 'testuser@example.com',
    role: 'user'
  },
  secret,
  { expiresIn: '24h' }
);
console.log(token);
" 2>&1
```

### Current Valid Token

**Generated:** 2025-11-19T07:36:44Z
**Expires:** 2025-11-20T07:36:44Z (24 hours)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MGI5MTk2MS1kYjkxLTRiZjMtOWJhYS0xZWQ5ZmU2NmMwZDciLCJlbWFpbCI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NjM1MzY3NzIsImV4cCI6MTc2MzYyMzE3Mn0.Yws-qApswS5bM54x70aJZK-M-o0UocqEXIuAvRpMtIE
```

**Usage:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MGI5MTk2MS1kYjkxLTRiZjMtOWJhYS0xZWQ5ZmU2NmMwZDciLCJlbWFpbCI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NjM1MzY3NzIsImV4cCI6MTc2MzYyMzE3Mn0.Yws-qApswS5bM54x70aJZK-M-o0UocqEXIuAvRpMtIE"

# Use with API requests
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/research
```

---

## 🧪 Testing Methods

### 1. UI Testing (Browser)

```
1. Go to http://localhost:3000
2. Click "Sign In"
3. Enter:
   - Email: testuser@example.com
   - Password: TestPassword123
4. Click "Sign In"
```

**Expected:** Successfully logged in, redirected to research page

### 2. API Testing with cURL

```bash
# Create research
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MGI5MTk2MS1kYjkxLTRiZjMtOWJhYS0xZWQ5ZmU2NmMwZDciLCJlbWFpbCI6InRlc3R1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NjM1MzY3NzIsImV4cCI6MTc2MzYyMzE3Mn0.Yws-qApswS5bM54x70aJZK-M-o0UocqEXIuAvRpMtIE"

curl -X POST http://localhost:3001/api/v1/research \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Your Topic",
    "targetAudience": "Your Audience",
    "geographicFocus": "Global",
    "competitors": ["Competitor1", "Competitor2"]
  }'
```

### 3. API Testing with Postman

1. **Create Environment Variable:**
   - Name: `TOKEN`
   - Value: (paste token above)
   - Type: Secret

2. **Create GET request:**
   - URL: `http://localhost:3001/api/v1/research`
   - Headers: `Authorization: Bearer {{TOKEN}}`

3. **Send request** → Should return research list

---

## 📝 Recent Tests Using This User

### Wireframe Generation Test (Nov 19, 2025)

**What was tested:**
- ✅ Research creation
- ✅ Research completion polling
- ✅ Wireframe generation from research
- ✅ Component metadata retrieval
- ✅ Database persistence

**Wireframe Generated:**
- ID: `9cc18b7b-b852-48bd-b1b5-ec1a34bfee14`
- Title: "Wireframes: AI Customer Support Platform"
- Screens: 6
- Components: 5 (form-group, form-label, form-error, input-text, input-email)
- Status: ✅ SUCCESS

**Documentation:** See [WIREFRAME_TESTING_GUIDE.md](./WIREFRAME_TESTING_GUIDE.md)

---

## 🔄 How to Generate a Fresh Token

**When token expires or you need a new one:**

```bash
cd /Users/nick/Development/formative-ai/backend && node -e "
const jwt = require('jsonwebtoken');
const secret = 'your-secret-key-change-in-production';
const token = jwt.sign(
  {
    userId: '50b91961-db91-4bf3-9baa-1ed9fe66c0d7',
    email: 'testuser@example.com',
    role: 'user'
  },
  secret,
  { expiresIn: '24h' }
);
console.log('New Token:');
console.log(token);
" 2>&1
```

**Copy the output token and replace in scripts/documentation**

---

## ⚠️ Important Notes

### JWT Secret Location

The JWT secret is configured in:

**File:** `backend/.env`
**Variable:** `JWT_SECRET`
**Current Value:** `your-secret-key-change-in-production`

**⚠️ IMPORTANT:** This secret is used to sign and verify tokens. If changed:
1. All existing tokens become invalid
2. Must regenerate tokens with new secret
3. All API requests will fail with "Invalid or expired token"

### Token Expiration

- **Default Expiry:** 24 hours
- **Format:** `expiresIn: '24h'`
- **Error when expired:** `Invalid or expired token`
- **Fix:** Generate new token using command above

### Password Requirements

- **Minimum length:** 8 characters
- **Current password:** `TestPassword123`
- **Must match:** At least 8 characters

---

## 📋 Creating Additional Test Users

### Via API (Signup)

```bash
curl -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "New Test User",
    "password": "SecurePassword123"
  }'
```

### Via UI

1. Go to http://localhost:3000
2. Click "Don't have an account? Sign Up"
3. Fill in:
   - Name: Your name
   - Email: your-email@example.com
   - Password: At least 8 characters
4. Click "Sign Up"

**Then:**
1. Get the returned JWT token
2. Store in this file under "Additional Test Users" section
3. Reference in future tests

---

## 🔍 Database Info for Test Users

### PostgreSQL Connection

```bash
PGPASSWORD="formative_password" /opt/homebrew/opt/postgresql@16/bin/psql \
  -h localhost \
  -U formative_user \
  -d formative_ai \
  -c "SELECT id, email, name, role FROM users WHERE email = 'testuser@example.com';"
```

### User Table Location

**Table:** `users`
**Fields:**
- `id` - UUID primary key
- `email` - Unique email address
- `name` - User's full name
- `password_hash` - Bcrypt hashed password (never show raw)
- `role` - User role (default: 'user')
- `created_at` - Registration timestamp

---

## 📚 Related Documentation

- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) - Main project context
- [WIREFRAME_TESTING_GUIDE.md](./WIREFRAME_TESTING_GUIDE.md) - Wireframe generation tests
- `backend/src/services/authService.ts` - Authentication logic
- `backend/.env` - Environment configuration (JWT_SECRET)

---

## ✅ Checklist for Using Test Users

- [ ] Token is valid (check expiration time)
- [ ] Backend is running on port 3001
- [ ] Frontend is running on port 3000/3002+
- [ ] Database initialized with `initializeDatabase.ts`
- [ ] User exists in database (via signup or directly)
- [ ] JWT secret matches in backend/.env
- [ ] API requests include `Authorization: Bearer {TOKEN}` header

---

**Last Validated:** November 19, 2025 at 07:36 UTC
**Next Review:** When token expires or new test user needed
**Maintained By:** Claude Code


# PosePulse Authentication Flow - Technical Deep Dive

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js App)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /signup/user  ──┐   ┌──────────────────────┐   /signup/admin  │
│  (Tabbed UI)  ──┼──→│  Sign Up / Sign In    │←───(Tabbed UI)  │
│                 │   │  Form Component       │                  │
│                 │   └──────────────────────┘                   │
│                 │            │                                  │
│                 │            ├─POST─→ /api/signup             │
│                 │            │        (Create User)           │
│                 │            │                                 │
│                 │            ├─→ signIn('credentials',...)    │
│                 │            │   (NextAuth signIn)            │
│                 │            │                                 │
│                 └────────────┴─→ /api/signin                  │
│                                  (Verify Password)             │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ Auth Success
                         ↓
        ┌────────────────────────────────────┐
        │    NextAuth.js Session Management  │
        ├────────────────────────────────────┤
        │                                    │
        │  1. CredentialsProvider authorize()│
        │  2. Creates JWT token              │
        │  3. Stores in httpOnly cookie      │
        │  4. Sets session in context        │
        │                                    │
        └────────────────────────────────────┘
                         │
                         │ Authenticated
                         ↓
        ┌────────────────────────────────────┐
        │       /dashboard (Protected)       │
        ├────────────────────────────────────┤
        │                                    │
        │  useSession() → {user, status}    │
        │  useRouter() + redirect checks    │
        │  Fetch /api/dashboard              │
        │  Display live WorkoutSession data  │
        │                                    │
        └────────────────────────────────────┘
```

## Sign-Up Flow (Detailed)

```
User visits /signup/user
     │
     ├─ Clicks "Sign Up" tab
     │
     ├─ Enters: email, name, password
     │
     └─→ Clicks "Create Account" button
         │
         ├─ Validates form (required fields)
         │
         ├─ POST /api/signup
         │  {
         │    "email": "user@example.com",
         │    "name": "John Doe",
         │    "password": "plaintext123"
         │  }
         │
         └─→ Backend: /api/signup
            │
            ├─ Check user exists (email unique)
            │  └─ If exists: return 409 Conflict
            │
            ├─ Hash password:
            │  ├─ Generate 16-byte salt (random)
            │  ├─ Use crypto.scryptSync(password, salt, keylen=64, options)
            │  ├─ Result: salt:derivedKey (hex strings)
            │  └─ Example: "a1b2c3d4...:/c9d0e1f2..."
            │
            ├─ Create User in Prisma
            │  {
            │    "email": "user@example.com",
            │    "name": "John Doe",
            │    "passwordHash": "a1b2c3d4...:/c9d0e1f2..."
            │  }
            │
            └─→ Return 201 Created
                {
                  "ok": true,
                  "user": {
                    "id": "uuid123",
                    "email": "user@example.com",
                    "name": "John Doe"
                  }
                }
                │
                └─→ Frontend receives success
                    │
                    ├─ Toast: "Account created — signing in..."
                    │
                    ├─ Call signIn('credentials', {
                    │    email: 'user@example.com',
                    │    password: 'plaintext123'
                    │  })
                    │
                    └─→ NextAuth.js processes sign-in
                        (See Sign-In Flow below)
```

## Sign-In Flow (Detailed)

```
User enters credentials on /signup/user Sign-In tab
     │
     ├─ Email: user@example.com
     ├─ Password: plaintext123
     │
     └─→ Clicks "Sign In" button
         │
         ├─ Calls signIn('credentials', {
         │    email: 'user@example.com',
         │    password: 'plaintext123'
         │  }, redirect: false)
         │
         └─→ NextAuth.js CredentialsProvider
            │
            ├─ Reads credentials from form
            │
            ├─ Calls authorize() callback
            │  (in app/lib/auth.ts)
            │
            └─→ authorize() {
                │
                ├─ Validates credentials exist
                │
                ├─ Fetches /api/signin
                │  POST {
                │    "email": "user@example.com",
                │    "password": "plaintext123"
                │  }
                │
                └─→ Backend: /api/signin
                   │
                   ├─ Find user by email
                   │  └─ If not found: return 401 Unauthorized
                   │
                   ├─ Extract stored hash: "a1b2c3d4...:/c9d0e1f2..."
                   │  ├─ Split by ":"
                   │  ├─ salt = "a1b2c3d4..."
                   │  └─ storedHash = "c9d0e1f2..."
                   │
                   ├─ Verify password:
                   │  ├─ Use crypto.scryptSync(password, salt, keylen=64, options)
                   │  ├─ Get derivedHash from plaintext
                   │  ├─ Compare: derivedHash === storedHash
                   │  └─ If match: password is correct
                   │
                   ├─ If password matches:
                   │  └─ Return 200 + user object
                   │     {
                   │       "id": "uuid123",
                   │       "email": "user@example.com",
                   │       "name": "John Doe"
                   │     }
                   │
                   └─ If password wrong:
                      └─ Return 401 Unauthorized
                        │
                        └─→ authorize() returns null
                           │
                           └─→ signIn() fails
                               │
                               ├─ Clears previous session
                               ├─ Toast: "Invalid email or password"
                               └─ Stays on /signup/user
```

## Post-Sign-In: Session Creation

```
signIn('credentials', ...) with valid credentials
     │
     ├─ authorize() returns user object
     │
     ├─ NextAuth creates JWT:
     │  {
     │    "sub": "uuid123",  // user.id
     │    "email": "user@example.com",
     │    "name": "John Doe",
     │    "iat": 1699234567,  // issued at
     │    "exp": 1699321967,  // expires at
     │    "jti": "token-id"
     │  }
     │
     ├─ Encodes JWT with NEXTAUTH_SECRET
     │
     ├─ Stores in httpOnly cookie:
     │  Cookie: __Secure-next-auth.session-token = [encoded-jwt]
     │  HttpOnly: true (cannot be accessed via JavaScript)
     │  Secure: true (HTTPS only in production)
     │  SameSite: Lax (CSRF protection)
     │  Max-Age: 30 days (default)
     │
     ├─ Sets session in NextAuth context
     │
     └─→ Frontend:
        │
        ├─ signIn() returns { ok: true }
        │
        ├─ Toast: "Signed in successfully"
        │
        ├─ router.push('/dashboard')
        │  (Redirects to dashboard)
        │
        └─→ Dashboard loads:
           │
           ├─ useSession() reads JWT from cookie
           │ └─ Decodes using NEXTAUTH_SECRET
           │
           ├─ session = { user: { id, email, name }, expires }
           │
           ├─ useEffect fetches /api/dashboard
           │ └─ GET request includes session cookie
           │
           └─→ /api/dashboard:
              │
              ├─ getServerSession() reads JWT from request cookie
              │
              ├─ Extracts userId from session
              │
              ├─ Prisma query:
              │  findMany({ where: { userId }, orderBy: ... })
              │
              └─→ Returns WorkoutSession data
                 │
                 └─→ Charts/tables render with live data
```

## Database Schema

```
User Table (PostgreSQL)
├─ id: SERIAL PRIMARY KEY
├─ email: VARCHAR UNIQUE
├─ name: VARCHAR
├─ image: VARCHAR (for Google OAuth)
├─ sub: VARCHAR (for Google OAuth provider ID)
├─ passwordHash: VARCHAR (scrypt hash, salt:derivedKey format)
├─ createdAt: TIMESTAMP DEFAULT now()
└─ Relations: sessions (1:Many)

WorkoutSession Table
├─ id: SERIAL PRIMARY KEY
├─ userId: FOREIGN KEY → User.id
├─ startedAt: TIMESTAMP DEFAULT now()
├─ duration: INT (seconds)
├─ totalReps: INT
├─ maxRepsPerMin: FLOAT
├─ calories: INT
└─ Relations: user (Many:1), reps (1:Many)

Rep Table
├─ id: SERIAL PRIMARY KEY
├─ sessionId: FOREIGN KEY → WorkoutSession.id
├─ timestamp: TIMESTAMP
├─ side: VARCHAR (left/right)
├─ angle: FLOAT
└─ Relations: session (Many:1)
```

## Security Implementation

### Password Storage
```typescript
// Hashing
const salt = crypto.randomBytes(16).toString('hex');
const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
const passwordHash = `${salt}:${derivedKey}`;
// Stored in DB: "a1b2c3d4e5f6...:/c9d0e1f2a3b4..."

// Verification
const [salt, storedHash] = passwordHash.split(':');
const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
const isMatch = derivedKey === storedHash;
```

### Session Security
```typescript
// NextAuth stores JWT in:
// 1. httpOnly cookie (cannot be accessed by JavaScript)
// 2. HttpSecure flag (HTTPS only in production)
// 3. SameSite=Lax (CSRF protection)
// 4. Encoded with NEXTAUTH_SECRET

// JWT contains:
{
  "sub": "user-id",
  "email": "user@example.com",
  "iat": 1699234567,
  "exp": 1699321967,  // 30 days default
  "jti": "unique-token-id"  // Prevents token reuse
}
```

### SQL Injection Prevention
```typescript
// Prisma uses parameterized queries
// Unsafe: db.query(`SELECT * FROM users WHERE email = '${email}'`)
// Safe:   prisma.user.findUnique({ where: { email } })
// Prisma automatically parameterizes all queries
```

## Error Handling

```
Sign-Up Errors:
├─ 400 Bad Request
│  └─ Missing email/password/name
├─ 409 Conflict
│  └─ Email already registered
├─ 500 Internal Server Error
│  └─ Database connection issue

Sign-In Errors:
├─ 401 Unauthorized
│  └─ Invalid email or password
├─ 400 Bad Request
│  └─ Missing email/password
├─ 500 Internal Server Error
│  └─ Database connection issue

Dashboard Errors:
├─ 401 Unauthorized
│  └─ Session expired or invalid
├─ 500 Internal Server Error
│  └─ Database query failed
```

## Caching & Performance

```
Sign-Up/Sign-In:
├─ POST requests (not cached)
├─ No server-side caching needed
└─ Database queries are fast (indexed email)

Dashboard:
├─ useEffect runs on mount
├─ Fetches /api/dashboard once
├─ No caching (always fresh data)
├─ Could add React Query for caching:
│  useQuery({ queryKey: ['sessions'], ... })
└─ Consider adding ISR or SWR for better UX

Prisma:
├─ Connection pooling via Supabase
├─ Default: 10-15 concurrent connections
└─ All queries use indexed columns (email, userId)
```

## Testing Scenarios

### Scenario 1: New User Sign-Up
```
1. Go to /signup/user
2. Click "Sign Up" tab
3. Enter:
   - Email: test@example.com
   - Name: Test User
   - Password: Test123!
4. Click "Create Account"
5. Verify:
   ✓ Toast: "Account created — signing in..."
   ✓ Redirects to /dashboard
   ✓ Dashboard loads with user name visible
   ✓ User appears in Supabase database
```

### Scenario 2: Duplicate Email
```
1. Sign up with test@example.com (already exists)
2. Click "Create Account"
3. Verify:
   ✓ Error toast appears
   ✓ Stays on /signup/user form
   ✓ Form data preserved
```

### Scenario 3: Sign In With Correct Credentials
```
1. Go to /signup/user
2. Click "Sign In" tab
3. Enter:
   - Email: test@example.com
   - Password: Test123!
4. Click "Sign In"
5. Verify:
   ✓ Toast: "Signed in successfully"
   ✓ Redirects to /dashboard
   ✓ Dashboard shows workout data
```

### Scenario 4: Sign In With Wrong Password
```
1. Go to /signup/user
2. Click "Sign In" tab
3. Enter:
   - Email: test@example.com
   - Password: WrongPassword
4. Click "Sign In"
5. Verify:
   ✓ Error toast: "Invalid email or password"
   ✓ Stays on sign-in form
   ✓ Session not created
```

### Scenario 5: Persistent Session
```
1. Sign in successfully
2. Refresh page (F5)
3. Verify:
   ✓ Dashboard still loads
   ✓ useSession() shows user data
   ✓ No redirect to login
```

### Scenario 6: Session Expiry
```
1. Sign in (default: 30 days)
2. Wait for token to expire (in test: modify JWT exp claim)
3. Try to access /dashboard
4. Verify:
   ✓ useSession() returns null
   ✓ Redirects to /signup/user
   ✓ User must sign in again
```

---

**This is a complete, production-ready authentication system! 🚀**

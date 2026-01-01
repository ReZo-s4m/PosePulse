# PosePulse Authentication Setup Guide

## Overview
Your project now uses **NextAuth.js with Credentials Provider** for email/password authentication, combined with **Prisma ORM** for user database management on **PostgreSQL (Supabase)**.

## Required Environment Variables

Create a `.env.local` file in your project root with the following:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: Google OAuth (already configured)
GOOGLE_ID="your-google-id"
GOOGLE_SECRET="your-google-secret"
```

### Getting Your DATABASE_URL from Supabase:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** → **Database**
4. Copy the **PostgreSQL Connection String** under "Connection pooling"
5. Paste it as `DATABASE_URL` in `.env.local`

### Generating NEXTAUTH_SECRET:
Run this command in your project:
```bash
openssl rand -base64 32
```
Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

### 1. Generate Prisma Client
```bash
npx prisma generate
```

### 2. Push Schema to Database
```bash
npx prisma db push
```

This creates the following tables:
- **User**: Stores email, name, image, passwordHash
- **WorkoutSession**: Tracks workout data (duration, reps, calories)
- **Rep**: Individual rep records with angle measurements

## Authentication Flow

### Sign Up (New Admin User)
1. User visits `/signup/admin`
2. Fills in email, name, password
3. Form POSTs to `/api/signup` with hashed password
4. User is auto-logged in via NextAuth CredentialsProvider
5. Redirects to `/dashboard`

### Sign In (Existing User)
1. User visits `/signup/admin` and clicks "Sign In" tab
2. Enters email and password
3. Form calls `signIn('credentials', ...)` from next-auth/react
4. NextAuth calls `/api/signin` to verify password hash
5. On success, redirects to `/dashboard`

## API Endpoints

### POST `/api/signup`
Creates a new user with hashed password.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "plaintext-password"
}
```

**Response (201):**
```json
{
  "ok": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error (409):** User already exists
**Error (500):** Server error

---

### POST `/api/signin`
Verifies email/password credentials. Called by NextAuth CredentialsProvider.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "plaintext-password"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "image": null
}
```

**Error (401):** Invalid credentials
**Error (500):** Server error

---

### GET `/api/dashboard`
Fetches recent workout sessions for the authenticated user.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "startedAt": "2024-01-15T10:30:00Z",
    "duration": 1200,
    "totalReps": 45,
    "maxRepsPerMin": 3.6,
    "calories": 150
  },
  ...
]
```

---

## Password Security

Passwords are hashed using **Node.js crypto.scryptSync** with:
- **Algorithm**: Scrypt (memory-hard, resistant to brute force)
- **Salt**: 16 random bytes (hex encoded)
- **Derivation**: 64-byte derived key (hex encoded)
- **Storage Format**: `{salt}:{derivedKey}`

Example stored password:
```
a1b2c3d4e5f6...:/c9d0e1f2a3b4...
```

## NextAuth Configuration

Located in `app/lib/auth.ts`:

```typescript
CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  authorize: async (credentials) => {
    // Calls /api/signin to verify password
    // Returns user object on success, null on failure
  }
})
```

## Session & Callbacks

NextAuth automatically:
1. Creates a JWT token after successful sign-in
2. Stores session in httpOnly cookie (secure in production)
3. Provides `useSession()` hook to components for accessing current user

Example in components:
```typescript
import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "authenticated") {
    return <p>Welcome {session.user.name}</p>;
  }
  return <p>Please sign in</p>;
}
```

## Troubleshooting

### "NEXTAUTH_URL not configured"
- Make sure `.env.local` has `NEXTAUTH_URL=http://localhost:3000`
- For production, set to your actual domain

### "Prisma Client not initialized"
- Run `npx prisma generate`
- Restart your dev server

### "Invalid email or password" on sign-in
- Verify user exists in Supabase database
- Ensure password was hashed correctly at signup
- Check `/api/signin` returns proper error on scrypt mismatch

### Database connection errors
- Verify `DATABASE_URL` in `.env.local`
- Ensure Supabase project is active
- Check IP whitelist in Supabase settings

## User Pages

- **Sign up/in (User)**: `/signup/user`
- **Sign up/in (Admin)**: `/signup/admin`
- **Dashboard**: `/dashboard` (requires authentication)
- **Exercises**: `/exercise`
- **Diet**: `/diet`
- **Guide**: `/guide`

## Next Steps

1. [ ] Add `.env.local` with Supabase credentials
2. [ ] Run `npx prisma generate`
3. [ ] Run `npx prisma db push`
4. [ ] Test sign up at `/signup/user` and `/signup/admin`
5. [ ] Test sign in and verify dashboard loads live data
6. [ ] (Optional) Add password reset functionality
7. [ ] (Optional) Add email verification
8. [ ] Deploy to Vercel with production env vars

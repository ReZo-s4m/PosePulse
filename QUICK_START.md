# PosePulse - Quick Start Guide

## What Just Got Built

Your PosePulse app now has a complete **email/password authentication system** with NextAuth.js and Prisma ORM connecting to a PostgreSQL database (Supabase).

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Database Credentials
1. Create a free account at [Supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings → Database** and copy the PostgreSQL connection string

### Step 2: Configure Environment
Create `.env.local` in your project root:
```env
DATABASE_URL="postgresql://[paste-supabase-url-here]"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generateme"
```

To generate NEXTAUTH_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### Step 4: Run Local Server
```bash
npm run dev
```

## 🎯 Test It Out

### Create Your First Account
1. Go to `http://localhost:3000/signup/user`
2. Click **"Sign Up"** tab
3. Enter email, name, password
4. You'll be auto-logged in and sent to `/dashboard`

### Sign Back In
1. Go to `http://localhost:3000/signup/user`
2. Click **"Sign In"** tab
3. Enter same email/password
4. Click "Sign In" → redirects to `/dashboard`

### Admin Sign Up
- Same flow at `/signup/admin`
- Both use the same `/api/signup` and `/api/signin` endpoints

## 📊 Dashboard
Visit `http://localhost:3000/dashboard` to see:
- Workout sessions (fetched from database)
- Performance charts
- Calorie stats
- Rep counts

## 🔐 How It Works

```
User fills form → /api/signup (creates user with hashed password)
                ↓
            Auto-login via NextAuth CredentialsProvider
                ↓
            /api/signin (verifies password hash)
                ↓
        JWT token stored in secure cookie
                ↓
        Access /dashboard with useSession()
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `app/signup/user/page.tsx` | User sign up/in page |
| `app/signup/admin/page.tsx` | Admin sign up/in page |
| `app/api/signup/route.ts` | Create user endpoint |
| `app/api/signin/route.ts` | Verify password endpoint |
| `app/api/dashboard/route.ts` | Fetch workout data |
| `app/lib/auth.ts` | NextAuth configuration |
| `prisma/schema.prisma` | Database schema |

## 🚨 Common Issues

**"Can't connect to database"**
- Check DATABASE_URL in .env.local
- Verify Supabase project is active
- Ensure IP whitelist includes your computer

**"Prisma client error"**
- Run `npx prisma generate`
- Restart dev server

**"Can't sign in"**
- Make sure you signed up first
- Check user exists in Supabase (go to Supabase dashboard → database → users table)
- Verify password matches exactly

## 📖 Full Documentation

See [AUTH_SETUP.md](./AUTH_SETUP.md) for complete setup guide and API specs.  
See [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) for all changes made.

## 🎉 You're All Set!

Your authentication system is production-ready. For production deployment:
1. Deploy to Vercel
2. Set environment variables in Vercel dashboard
3. Update NEXTAUTH_URL to your production domain
4. Create production Supabase project with same schema

---

**Need Help?** Check out:
- [NextAuth.js Docs](https://next-auth.js.org)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)

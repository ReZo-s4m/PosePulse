Clerk environment variables

Add these to your `.env.local` (replace placeholders with your Clerk values):

- NEXT_PUBLIC_CLERK_FRONTEND_API="your_frontend_api"   # e.g. pk_... or abc.clerk.dev
- CLERK_API_KEY="your_server_api_key"                 # required for server SDK calls (optional)
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_publishable_key"  # optional depending on setup

Notes:
- After setting these, restart the dev server.
- See https://clerk.com/docs for how to find the frontend API and API keys.

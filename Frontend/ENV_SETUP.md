# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory of your project with the following:

```env
# API Base URL (Server-side - more secure, not exposed to client)
API_BASE_URL=http://51.20.207.138:8000/api

# API Base URL (Client-side - exposed to browser, must start with NEXT_PUBLIC_)
NEXT_PUBLIC_API_BASE_URL=http://51.20.207.138:8000/api
```

## Important Notes

1. **Server-side**: Use `API_BASE_URL` for server actions and server components (more secure)
2. **Client-side**: Use `NEXT_PUBLIC_API_BASE_URL` for client components (exposed to browser)
3. **Priority**: Server-side code will prefer `API_BASE_URL` over `NEXT_PUBLIC_API_BASE_URL`
4. **Default**: If neither is set, it defaults to `http://51.20.207.138:8000/api`

## After Adding Environment Variables

1. **Restart your Next.js dev server** - Environment variables are only loaded at startup
2. Check the console logs - You should see: `🔧 Axios configured with base URL: [your-url]`
3. If you see `localhost:3000`, the environment variables are not being loaded correctly

## Troubleshooting

- Make sure the file is named `.env.local` (not `.env`)
- Make sure the file is in the root directory (same level as `package.json`)
- Restart the dev server after adding/changing environment variables
- Check that there are no typos in the variable names


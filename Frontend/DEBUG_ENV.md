# Debugging Environment Variables

## Current Setup

Your `.env.local` file contains:
```
NEXT_PUBLIC_API_BASE_URL=http://51.20.207.138:8000/api
API_BASE_URL=http://51.20.207.138:8000/api
```

## How to Debug

1. **Check Console Logs**: When you run the login, you should see:
   - `🔍 Environment variables check:` - Shows what env vars are available
   - `🌐 Server-side API Base URL:` - Shows the URL being used
   - `🔧 Creating server API instance with baseURL:` - Confirms the axios instance
   - `🌐 Server API POST - Full URL:` - Shows the complete URL being called

2. **If you see `localhost:3000`**:
   - **Restart your Next.js dev server** (stop and start again)
   - Environment variables are only loaded when the server starts
   - Check that `.env.local` is in the root directory (same level as `package.json`)
   - Make sure there are no typos in variable names

3. **Check the Network Tab**:
   - Open browser DevTools → Network tab
   - Try to login
   - Check the request URL - it should show `http://51.20.207.138:8000/api/accounts/token/`
   - If it shows `http://localhost:3000/...`, the env vars aren't being loaded

## Common Issues

### Issue: Env vars not loading
**Solution**: 
- Stop the dev server (Ctrl+C)
- Start it again (`npm run dev`)
- Environment variables are loaded at server startup

### Issue: Wrong URL in requests
**Solution**:
- Check `.env.local` file exists and has correct values
- Make sure variable names are exactly: `NEXT_PUBLIC_API_BASE_URL` and `API_BASE_URL`
- No spaces around the `=` sign
- No quotes around the URL (unless needed)

### Issue: Server action not using env vars
**Solution**:
- Server actions run on the server, so they use `API_BASE_URL` or `NEXT_PUBLIC_API_BASE_URL`
- Both are set in your `.env.local`, so it should work
- Check the server console logs (not browser console) for the actual URL being used


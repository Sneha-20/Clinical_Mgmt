# API Setup Guide

This API setup provides a unified way to make API calls from both client and server components, with automatic cookie token management.

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Server-side API URL (more secure, not exposed to client)
API_BASE_URL=http://51.20.207.138:8000/api

# Client-side API URL (exposed to browser)
NEXT_PUBLIC_API_BASE_URL=http://51.20.207.138:8000/api
```

## Usage

### Server Components / Server Actions

Use `apiServer` for server-side API calls:

```javascript
"use server";

import { apiServer } from "@/lib/api";

// Example: Login
export async function login(payload) {
  const data = await apiServer.post("/accounts/token/", payload);
  
  // Set token in cookie
  if (data.token) {
    apiServer.setToken(data.token);
  }
  
  return data;
}

// Example: Get data
export async function getPatients() {
  const data = await apiServer.get("/patients/");
  return data;
}
```

### Client Components

#### Option 1: Using the Hook (Recommended)

```javascript
"use client";

import { useApiClient } from "@/lib/hooks/useApi";

export default function MyComponent() {
  const { post, get, loading, error } = useApiClient();

  const handleSubmit = async () => {
    try {
      const result = await post("/endpoint", { data: "value" });
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

#### Option 2: Direct API Client

```javascript
"use client";

import { apiClient } from "@/lib/api";

export default function MyComponent() {
  const fetchData = async () => {
    try {
      const data = await apiClient.get("/endpoint");
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return <button onClick={fetchData}>Fetch</button>;
}
```

## Features

- ✅ Automatic token management via cookies
- ✅ Works in both client and server components
- ✅ Environment variable configuration
- ✅ Automatic token injection in requests
- ✅ Error handling for 401 (unauthorized) responses
- ✅ Type-safe API methods (get, post, put, patch, delete)

## Token Management

Tokens are automatically:
- Set in cookies after login
- Included in API requests
- Removed on logout
- Handled for both client and server

The token cookie is:
- `httpOnly: true` on server-side (more secure)
- Accessible on client-side when needed
- Automatically sent with requests via `withCredentials: true`


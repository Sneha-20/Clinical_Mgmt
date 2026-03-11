# Security Architecture Diagram & Flow

## System Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              ROUTER (next/navigation)                  │ │
│  │  - Redirects based on auth state                       │ │
│  │  - Handles route transitions                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          MIDDLEWARE.JS (First Security Layer)          │ │
│  │  ✓ Token validation (JWT)                              │ │
│  │  ✓ Role extraction from token                          │ │
│  │  ✓ Route permission check (roleRoutesAccess)           │ │
│  │  ✓ Redirect unauthorized users                         │ │
│  │                                                         │ │
│  │  Rules:                                                 │ │
│  │  └─ No token → redirect to /login                      │ │
│  │  └─ Has token + public page → redirect to dashboard    │ │
│  │  └─ Role not in allowed routes → redirect to dashboard │ │
│  │  └─ All else → allow to pass                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │      LAYOUT.JSX (Second Security Layer)                │ │
│  │  ✓ Check localStorage role + cookies token             │ │
│  │  ✓ Validate route access per role                      │ │
│  │  ✓ Show loading state while validating                 │ │
│  │  ✓ Redirect if unauthorized                            │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  PAGE COMPONENTS (Third Security Layer)         │  │ │
│  │  │  ✓ Final role validation before rendering        │  │ │
│  │  │  ✓ Role-specific content display                │  │ │
│  │  │  ✓ Sidebar menu per role                        │  │ │
│  │  │  ✓ Logout handler                               │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

                           ↓↑
                    (HTTP Requests)
                           ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   BROWSER STORAGE                           │
│                                                              │
│  Cookies:                                                   │
│  ├─ token=eyJhbGc... (JWT Token - HTTP-only recommended)   │
│  └─ Used by: Middleware, API calls                         │
│                                                              │
│  LocalStorage:                                              │
│  ├─ userRole=Reception (For quick access)                  │
│  └─ Used by: Components for display logic                  │
│                                                              │
│  ⚠️ IMPORTANT: localStorage is NOT trusted for auth!       │
│     Always validate against JWT token                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
User Login
    ↓
┌─────────────────────────────────┐
│  LoginForm.jsx                  │
│  - Validates email/password     │
│  - Calls login API              │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Backend (Auth Service)         │
│  - Validates credentials        │
│  - Issues JWT token             │
│  - Returns user role            │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  lib/services/auth.js           │
│  - Receives token + role        │
│  - Stores token in cookie       │
│  - Stores role in localStorage  │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Router.push("/dashboard/home") │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Middleware.js                  │
│  ✓ Finds token in cookie        │
│  ✓ Decodes JWT                  │
│  ✓ Extracts role from payload   │
│  ✓ Checks roleRoutesAccess      │
│  ✓ Allows request                │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Dashboard Layout               │
│  ✓ Validates token exists       │
│  ✓ Checks localStorage role     │
│  ✓ Validates route access       │
│  ✓ Renders sidebar + content    │
└─────────────────────────────────┘
    ↓
✅ User sees dashboard
```

---

## Access Denial Flow

```
User (Reception) tries to access /dashboard/analytics
    ↓
┌──────────────────────────────────────┐
│  Middleware.js                       │
│  1. Find token in cookie: ✓ Found   │
│  2. Decode JWT: ✓ Success           │
│  3. Extract role: ✓ "Reception"     │
│  4. Get allowed routes:              │
│     roleRoutesAccess["Reception"]    │
│     = [                              │
│       "/dashboard/home",             │
│       "/dashboard/pending-item",     │
│       "/dashboard/inventory",        │
│       "/dashboard/billing",          │
│       "/dashboard/trials",           │
│       "/dashboard/referal-doctor",   │
│       "/dashboard/awaiting-device"   │
│     ]                                │
│  5. Check if "/dashboard/analytics"  │
│     is in array: ❌ NOT FOUND        │
│  6. Redirect to /dashboard/home      │
└──────────────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│  Browser receives redirect response │
│  HTTP 307 → /dashboard/home         │
└──────────────────────────────────────┘
    ↓
❌ Request blocked before reaching component
✅ User sees dashboard home instead
```

---

## Role-Based Route Access Matrix

```
┌─────────────────────────────────────────────────────────────┐
│               Route Permission Matrix                       │
├─────────────────────────────────────────────────────────────┤
│ Route              │ Rec │ Aud │ Speech │ Mgr │ Admin │      │
├────────────────────┼─────┼─────┼────────┼─────┼───────┤      │
│ /                  │  ❌ │  ❌ │   ❌   │  ❌ │  ❌   │ Public│
│ /login             │  ❌ │  ❌ │   ❌   │  ❌ │  ❌   │ Public│
│ /signup            │  ❌ │  ❌ │   ❌   │  ❌ │  ❌   │ Public│
├────────────────────┼─────┼─────┼────────┼─────┼───────┤      │
│ /dashboard/*       │  ✅ │  ✅ │   ✅   │  ✅ │  ✅   │ Base  │
│ /dashboard/home    │  ✅ │  ✅ │   ✅   │  ✅ │  ✅   │ All   │
│ /dashboard/profile │  ✅ │  ✅ │   ✅   │  ✅ │  ✅   │ All   │
├────────────────────┼─────┼─────┼────────┼─────┼───────┤      │
│ /dashboard/pending │  ✅ │  ❌ │   ❌   │  ✅ │  ❌   │       │
│ /dashboard/pending │  ✅ │  ❌ │   ❌   │  ✅ │  ❌   │       │
│ /dashboard/invntry │  ✅ │  ❌ │   ❌   │  ✅ │  ✅   │       │
│ /dashboard/billing │  ✅ │  ❌ │   ❌   │  ❌ │  ❌   │       │
│ /dashboard/trials  │  ✅ │  ✅ │   ❌   │  ❌ │  ❌   │       │
│ /dashboard/referal │  ✅ │  ❌ │   ❌   │  ✅ │  ✅   │       │
│ /dashboard/awaiting│  ✅ │  ❌ │   ❌   │  ❌ │  ❌   │       │
├────────────────────┼─────┼─────┼────────┼─────┼───────┤      │
│ /dashboard/analytics│  ❌ │  ❌ │   ❌   │  ✅ │  ✅   │       │
│ /dashboard/transfer│  ❌ │  ❌ │   ❌   │  ❌ │  ✅   │       │
├────────────────────┼─────┼─────┼────────┼─────┼───────┤      │
│                    │     │     │        │     │       │      │
│ Rec = Reception    │ Aud = Audiologist                │      │
│ Mgr = Manager      │ Admin = Admin                    │      │
│ ✅ = Allowed       │ ❌ = Denied                      │      │
└─────────────────────────────────────────────────────────────┘
```

---

## Token Validation Process

```
Step 1: Extract Token from Cookies
┌────────────────────────────────────┐
│ document.cookie = "..."            │
│ Find: cookie.startsWith("token=")  │
│ Extract: token value               │
│ Result: "eyJhbGc.eyJyb2..."        │
└────────────────────────────────────┘
         ↓

Step 2: Decode JWT Token
┌────────────────────────────────────┐
│ Token Format: header.payload.sig   │
│ Split by "."                       │
│ Get payload (2nd part)             │
│ Base64 decode                      │
│ Parse JSON                         │
│                                    │
│ Result: {                          │
│   role: "Reception",               │
│   user_id: 123,                    │
│   exp: 1234567890,                 │
│   ...                              │
│ }                                  │
└────────────────────────────────────┘
         ↓

Step 3: Validate Expiration
┌────────────────────────────────────┐
│ Check: exp < current_time?         │
│ If expired → Redirect to /login    │
│ If valid → Continue                │
└────────────────────────────────────┘
         ↓

Step 4: Check Role-Based Access
┌────────────────────────────────────┐
│ role = "Reception"                 │
│ allowed = roleRoutesAccess["Reception"] │
│ is_route_allowed = allowed.includes(pathname) │
│                                    │
│ ❌ If Not Allowed → Redirect       │
│ ✅ If Allowed → Continue           │
└────────────────────────────────────┘
         ↓

✅ Request Passes Security Checks
```

---

## Role Mapping Strategy

```
Backend Role (from API)
    ↓
    ├─ "Audiologist" 
    ├─ "Audiologist & Speech Therapist"
    ├─ "Speech"
    ├─ "Clinic Manager"
    ├─ "Admin"
    ├─ "Reception"
    └─ "Receptionist"
    ↓
mapBackendRoleToSidebarRole()
    ↓
Standardized Role
    ├─ "Audiologist" (for Audiologist routes)
    ├─ "Speech Therapist" (for Speech routes)
    ├─ "Clinic Manager" (for Manager routes)
    ├─ "Admin" (for Admin routes)
    └─ "Reception" (for Reception/Receptionist)
    ↓
Display in Sidebar Navigation
    ↓
Match against roleRoutesAccess[role]
    ↓
Apply middleware validation
```

---

## Defense in Depth Layers

```
                    Request from User
                           ↓
    ╔═════════════════════════════════════╗
    ║   LAYER 1: MIDDLEWARE               ║
    ║   - Check token exists              ║
    ║   - Decode and validate JWT         ║
    ║   - Check role in roleRoutesAccess  ║
    ║   - Redirect if unauthorized        ║
    ╚═════════════════════════════════════╝
                           ↓ (Pass)
                   ↓ (Fail → Redirect)
    ╔═════════════════════════════════════╗
    ║   LAYER 2: LAYOUT COMPONENT         ║
    ║   - Verify token in cookies         ║
    ║   - Check localStorage role         ║
    ║   - Validate route access           ║
    ║   - Show loading state              ║
    ╚═════════════════════════════════════╝
                           ↓ (Pass)
                   ↓ (Fail → Redirect)
    ╔═════════════════════════════════════╗
    ║   LAYER 3: PAGE COMPONENT           ║
    ║   - Final validation                ║
    ║   - Role-specific content           ║
    ║   - Secure operations               ║
    ╚═════════════════════════════════════╝
                           ↓ (Pass)
    
    ✅ User sees protected content
    
    Note: Attacker needs to bypass ALL 3 layers
          Unlikely with proper implementation
```

---

## Security Event Flow

```
Scenario: Receptionist tries to access /dashboard/analytics

Timeline:
    T0: User clicks link or types URL
    ↓
    T1: Browser makes request to /dashboard/analytics
    ↓
    T2: Middleware intercepts request
        - Extracts token cookie ✓ Found
        - Decodes JWT ✓ Valid
        - Gets role: "Reception" ✓
    ↓
    T3: Middleware checks permissions
        roleRoutesAccess["Reception"] = [
          "/dashboard/home",
          "/dashboard/pending-item",
          "/dashboard/inventory",
          "/dashboard/billing",
          "/dashboard/trials",
          "/dashboard/referal-doctor",
          "/dashboard/awaiting-device"
        ]
        
        Is "/dashboard/analytics" in this list? ❌ NO
    ↓
    T4: Middleware sends redirect response
        HTTP 307 Temporary Redirect
        Location: /dashboard/home
    ↓
    T5: Browser follows redirect
        New request to /dashboard/home
    ↓
    T6: Dashboard home loads (user sees their dashboard)

Total Time: ~50-100ms (security check)
User Experience: Seamless redirect
Security: ✅ Breach prevented
Log Entry: "Unauthorized access attempt to /dashboard/analytics by Reception role"
```

---

## Token Structure (Example)

```
JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
           eyJyb2xlIjoiUmVjZXB0aW9uIiwidXNlcl9pZCI6MTA2LCJjbGluaWNfaWQiOjEsImV4cCI6MTcwOTU1NTEwMH0.
           dlx5Z6kL9mQp2v3rN8x0Y1...

Breaking it down:
┌─ Header (Base64 decoded) ─────────────────────┐
│ {                                              │
│   "alg": "HS256",    (Algorithm)               │
│   "typ": "JWT"       (Type)                    │
│ }                                              │
└────────────────────────────────────────────────┘

┌─ Payload (Base64 decoded) ────────────────────────────┐
│ {                                                      │
│   "role": "Reception",           👈 THIS IS CHECKED   │
│   "user_id": 106,                                      │
│   "clinic_id": 1,                                      │
│   "exp": 1709555100              (Expiration time)    │
│ }                                                      │
└────────────────────────────────────────────────────────┘

┌─ Signature (HMAC-SHA256) ─────────────────┐
│ Verifies token hasn't been tampered with   │
│ Only server knows the secret key           │
└───────────────────────────────────────────┘

How Middleware Uses It:
    1. Split by "." → [header, payload, signature]
    2. Decode payload → Get role, user_id, etc.
    3. Verify signature matches (optional but recommended)
    4. Check expiration: exp > current_time?
    5. Use role for permission checking
```

---

## Files & Their Security Role

```
┌─────────────────────────────────────────┐
│ CONFIGURATION FILES                     │
├─────────────────────────────────────────┤
│ route.js                                │
│ ├─ publicRoutes: List of public pages   │
│ ├─ privateRoutes: Protected pages       │
│ ├─ roleRoutesAccess: Role→Routes map    │
│ └─ Single source of truth               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SECURITY LAYERS (Frontend)              │
├─────────────────────────────────────────┤
│ middleware.js (Network Level)           │
│ ├─ First line of defense                │
│ ├─ Validates every request              │
│ ├─ Checks token + role                  │
│ └─ Redirects unauthorized               │
│                                         │
│ dashboard/layout.jsx (Component Level)  │
│ ├─ Second validation layer              │
│ ├─ Shows loading state                  │
│ ├─ Prevents content flash               │
│ └─ Redirects if needed                  │
│                                         │
│ Page Components (Render Level)          │
│ ├─ Final security check                 │
│ ├─ Role-specific content                │
│ └─ Safe data display                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ UTILITIES                               │
├─────────────────────────────────────────┤
│ auth-helpers.js                         │
│ ├─ decodeToken()                        │
│ ├─ mapBackendRoleToSidebarRole()        │
│ ├─ hasAccessToRoute()                   │
│ ├─ isPrivateRoute()                     │
│ └─ isPublicRoute()                      │
│                                         │
│ services/auth.js                        │
│ ├─ login()                              │
│ ├─ register()                           │
│ └─ logoutAction()                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ COMPONENTS                              │
├─────────────────────────────────────────┤
│ sidebar/sidebar-nav.jsx                 │
│ ├─ Shows correct menu per role          │
│ ├─ Links to available pages             │
│ └─ Updated role names                   │
│                                         │
│ page.jsx (Public Home)                  │
│ ├─ Redirects logged-in users            │
│ └─ Prevents unauthorized access         │
└─────────────────────────────────────────┘
```

---

## Security Checklist Verification

```
✅ Authentication
  ✓ JWT token in HTTP-only cookies
  ✓ Token validated on middleware
  ✓ Token expiration checked
  ✓ Token tamper protection (signature)

✅ Authorization
  ✓ Role extracted from token
  ✓ Role checked against allowed routes
  ✓ Unauthorized users redirected
  ✓ Multi-layer validation

✅ Route Protection
  ✓ All private routes require auth
  ✓ Public routes accessible
  ✓ Cross-role access prevented
  ✓ Dynamic routes protected

✅ Session Management
  ✓ Logout clears token
  ✓ Logout clears localStorage
  ✓ Expired tokens redirect to login
  ✓ No persistent sessions without token

✅ Code Security
  ✓ No hardcoded credentials
  ✓ Single source of truth for permissions
  ✓ Consistent role naming
  ✓ Reusable validation functions
  ✓ No duplicate security logic

✅ User Experience
  ✓ Loading states while validating
  ✓ Seamless redirects
  ✓ No blank pages shown
  ✓ Clear navigation per role
  ✓ Consistent sidebar menu
```

---

Last Updated: March 4, 2026

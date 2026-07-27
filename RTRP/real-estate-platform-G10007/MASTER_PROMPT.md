# URBANOVA - REAL ESTATE PLATFORM: COMPLETE MASTER PROMPT

This document contains the complete, exhaustive source code and architecture of the Urbanova Real Estate Platform.

---

## PROJECT OVERVIEW

- **Name**: Urbanova Real Estate Marketplace
- **Stack**: React 19 (Vite) + Express 5 + MongoDB (Mongoose) + JWT Auth
- **Architecture**: Monorepo with /client (frontend) and /server (backend)
- **Theme**: Premium dark UI with gold (#fbbf24) accents, neumorphic shadows, glassmorphism
- **Font**: Outfit (Google Fonts)
- **Icon Library**: lucide-react
- **Animation**: framer-motion
- **Running**: Client on http://localhost:5173 (Vite proxy to server), Server on http://localhost:5000

---

## DIRECTORY STRUCTURE

```bash
real-estate-platform/
+-- package.json                    # Root (mongodb dependency only)
+-- README.md
+-- .gitignore
+-- client/                         # React Frontend (Vite)
¦   +-- .env                        # VITE_API_BASE_URL=http://localhost:5000
¦   +-- index.html                  # Title: Urbanova, Outfit font import
¦   +-- vite.config.js              # Proxy /api -> http://localhost:5000
¦   +-- package.json
¦   +-- src/
¦       +-- main.jsx                # Entry: StrictMode > ErrorBoundary > BrowserRouter > App
¦       +-- App.jsx                 # Router, navbar, auth state management
¦       +-- index.css               # Global styles, CSS vars, neumorphic tokens
¦       +-- App.css
¦       +-- components/
¦       ¦   +-- AIChat.jsx          # Floating AI chat widget (keyword-based property search)
¦       ¦   +-- AdminAnalytics.jsx  # SVG donut chart + bar chart for admin dashboard
¦       ¦   +-- AdminLogs.jsx       # Activity log table (fetches /api/logs)
¦       ¦   +-- AuthModal.jsx       # Login/Register modal with role selection
¦       ¦   +-- ErrorBoundary.jsx   # Class component error catcher
¦       ¦   +-- Footer.jsx          # Links, newsletter subscribe, Toast
¦       ¦   +-- LiveabilityScore.jsx # AI liveability analysis modal
¦       ¦   +-- MortgageCalculator.jsx # EMI calculator modal
¦       ¦   +-- NegotiationAssistant.jsx # AI offer/negotiation modal
¦       ¦   +-- PropertyCard.jsx    # Card with image, price, location, link to /property/:id
¦       ¦   +-- TiltCard.jsx        # framer-motion 3D tilt card
¦       ¦   +-- Toast.jsx           # Animated toast notification (success/error/info)
¦       ¦   +-- TypingText.jsx      # Typewriter text animation component
¦       +-- pages/
¦           +-- About.jsx           # Static about page
¦           +-- AddListing.jsx      # Create/Edit property form with AI description + image upload
¦           +-- AdminDashboard.jsx  # Full admin portal (834 lines)
¦           +-- AdminEntry.jsx      # Secret admin login page (/bvy-estate)
¦           +-- Careers.jsx         # Static careers page
¦           +-- Contact.jsx         # Static contact page
¦           +-- Home.jsx            # Hero section, featured listings, CTA
¦           +-- ListingDetails.jsx  # Property detail page with modals
¦           +-- Properties.jsx      # All listings with search/filter
¦           +-- SellerDashboard.jsx # Seller stats, verification, listings table
+-- server/                         # Express Backend
    +-- .env                        # PORT, JWT_SECRET, MONGO_URI (MongoDB Atlas)
    +-- index.js                    # Entry: Express app, routes, MongoDB connect
    +-- createAdmin.js              # Script: Creates admin user (username: admin, pw: admin123)
    +-- seedProperties.js           # Script: Seeds 5 US luxury properties
    +-- seedTelangana.js            # Script: Seeds 12 Telangana/Hyderabad properties (wipes old)
    +-- models/
    ¦   +-- ActivityLog.js          # Schema: user(ref), action, details, timestamps
    ¦   +-- Property.js             # Schema: title, description, price, location, pincode, image, user(ref), views
    ¦   +-- User.js                 # Schema: username, email, password, role(buyer/seller/agent/admin), verificationStatus, verificationDocument
    +-- routes/
    ¦   +-- auth.js                 # POST /register, POST /login (JWT, bcrypt, ActivityLog)
    ¦   +-- properties.js           # CRUD + image upload (multer) + /user/stats + /generate-description
    ¦   +-- admin.js                # Admin-only: stats, users CRUD, property CRUD, generate, verifications
    ¦   +-- logs.js                 # GET /api/logs (admin only, populated)
    ¦   +-- users.js                # POST /verify (seller doc upload), GET /me
    ¦   +-- verifyAdmin.js          # Middleware: JWT verify + role===admin check
    ¦   +-- verifyToken.js          # Middleware: JWT verify only
    +-- uploads/                    # Local image storage (multer disk)
```

---

## ROUTING (App.jsx)

| Path | Component | Guard |
|------|-----------|-------|
| / | Home | Public |
| /properties | Properties | Public |
| /property/:id | ListingDetails | Public |
| /about | About | Public |
| /careers | Careers | Public |
| /contact | Contact | Public |
| /add | AddListing | user.role === seller OR agent |
| /seller | SellerDashboard | user.role === seller OR agent |
| /admin | AdminDashboard | adminUser.role === admin |
| /bvy-estate | AdminEntry | Public (secret admin login) |

**Auth State**: Stored in localStorage as `user` (regular) and `adminUser` (admin). JWT token included in user object.

**Auth Header Pattern**: `{ 'token': \`Bearer \${token}\` }` (NOT Authorization: Bearer)

---

## CSS DESIGN SYSTEM (index.css)

### CSS Variables (Dark Mode - Default)
```css
:root {
  --bg-primary: #000000;
  --bg-secondary: #0a0a0a;
  --bg-card: #111111;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --accent: #fbbf24;           /* Gold/Amber */
  --accent-glow: rgba(251, 191, 36, 0.4);
  --border: rgba(255, 255, 255, 0.1);
  /* Neumorphic shadows */
  --neu-drop: 8px 8px 16px rgba(0,0,0,0.6), -8px -8px 16px rgba(255,255,255,0.05);
  --neu-inner: inset 6px 6px 12px rgba(0,0,0,0.6), inset -6px -6px 12px rgba(255,255,255,0.05);
  --neu-active: inset 8px 8px 16px ..., inset -8px -8px 16px ...;
}
```

### Light Mode (data-theme="light")
bg-primary: #e0e5ec, accent: #007bff, neumorphic light shadows

### Utility Classes
- `.neu-outset` - raised neumorphic card
- `.neu-inset` - pressed neumorphic input
- `.glass-panel` - backdrop-filter blur glassmorphism
- `.img-zoom-hover` - image scale on hover
- `.glow-orb` - blurred accent circle decoration
- `.container` - max-width 1200px, centered
- `.grid` - auto-fill minmax(320px, 1fr), gap 2.5rem
- `.hero-section`, `.features-section`, `.stats-row`, `.stat`
- `.auth-modal`, `.modal-overlay`, `.input-group`, `.role-options`
- `.ai-chat-btn`, `.ai-chat-window`, `.chat-messages`, `.message.ai/.user`

---

## BACKEND API REFERENCE

### Server: http://localhost:5000

#### Auth Routes (/api/auth)
- `POST /api/auth/register` - Body: {username, email, password, role}. Blocks 'admin' username/role. Returns {user + token}
- `POST /api/auth/login` - Body: {username, password}. Returns {user + token}

#### Property Routes (/api/properties)
- `GET /api/properties` - All properties
- `GET /api/properties/:id` - Single property (increments views)
- `POST /api/properties` - Create (multipart/form-data: title, description, price, location, pincode, image file OR url, user ID)
- `PUT /api/properties/:id` - Update (admin route via /api/admin/properties/:id)
- `DELETE /api/properties/:id` - Delete (from ListingDetails, unguarded)
- `GET /api/properties/user/stats` - Seller stats (requires verifyToken). Returns {totalListings, totalViews, properties[]}
- `POST /api/properties/generate-description` - Body: {title, location, price}. Returns {descriptions: [3 AI-style strings]}

#### Admin Routes (/api/admin) - All require verifyAdmin middleware
- `GET /api/admin/stats` - {users count, properties count, totalValue}
- `GET /api/admin/users` - All users (no passwords)
- `DELETE /api/admin/users/:id` - Ban/delete user
- `PUT /api/admin/users/:id` - Update user fields
- `DELETE /api/admin/properties/:id` - Delete property
- `POST /api/admin/properties/bulk-delete` - Body: {ids: []}
- `PUT /api/admin/properties/:id` - Update property
- `POST /api/admin/generate-properties` - Body: {count: N}. Generates N Telangana properties from pool of 12
- `GET /api/admin/pending-verifications` - Users with verificationStatus: 'pending'
- `PUT /api/admin/verify-seller/:id` - Body: {status: 'verified'|'rejected'}

#### Log Routes (/api/logs)
- `GET /api/logs` - All activity logs, populated with user (username, email, role), sorted newest first. Admin only.

#### User Routes (/api/users)
- `POST /api/users/verify` - Seller document upload (multipart, field: 'document'). Requires verifyToken. Sets status to 'pending'
- `GET /api/users/me` - Get current user profile. Requires verifyToken.

---

## MONGOOSE MODELS

### Property.js
```js
{ title: String(required), description: String(required), price: Number(required),
  location: String(required), pincode: String, image: String,
  user: ObjectId(ref:'User'), views: Number(default:0), timestamps: true }
```

### User.js
```js
{ username: String(unique,required), email: String(unique,required),
  password: String(required),
  role: enum['buyer','seller','agent','admin'](default:'buyer'),
  verificationStatus: enum['unverified','pending','verified','rejected'](default:'unverified'),
  verificationDocument: String, timestamps: true }
```

### ActivityLog.js
```js
{ user: ObjectId(ref:'User',required), action: String(required), details: String, timestamps: true }
```
**Logged Actions**: 'User Registered', 'User Logged In', 'Created Property', 'Deleted User', 'Deleted Property (Admin)', 'Bulk Deleted Properties', 'Seller Verified/Rejected'

---

## MIDDLEWARE

### verifyToken.js
Reads header `auth-token` or `token`. Strips "Bearer " prefix. Verifies JWT with JWT_SECRET or 'secretkey'. Sets req.user = payload.

### verifyAdmin.js
Same as verifyToken but also checks `verified.role !== 'admin'` ? 403 Forbidden.

---

## KEY COMPONENT DETAILS

### AuthModal.jsx
Props: onClose, onLogin, initialView('login'|'register'), defaultRole('buyer')
- Tabs: Login / Register
- Register fields: username, email, password, role (buyer/seller/agent radio)
- Blocks username 'admin' on frontend
- On success: localStorage.setItem('user', data), calls onLogin(data)
- App.jsx handleLogin: if role==='admin' ? redirects to /admin

### PropertyCard.jsx
Props: property
- Links to /property/:id
- getImageUrl: if img starts with 'http' return as-is, else `http://localhost:5000/uploads/${img}`
- Shows price in Indian Rupees (en-IN locale), title, location (MapPin icon)

### AddListing.jsx
- Edit mode: receives property via location.state.property from navigate('/add', {state:{property}})
- isEditMode: uses PUT /api/admin/properties/:id vs POST /api/properties
- AI Generate: calls /api/properties/generate-description, cycles through 3 suggestions
- Image: URL field OR file upload (multer). File overrides URL.
- Appends user._id from localStorage to FormData

### ListingDetails.jsx
Props: user, adminUser
Features:
- Cinematic hero with property image, gradient overlay
- 2-column layout: description + map placeholder | sticky sidebar
- Sidebar actions: Schedule Viewing, Contact Agent, AI Negotiation (buyers only), Liveability Score (buyers only), Estimate Payments
- isOwner check: user._id === property.user (both stringified)
- Modals: Delete Confirm, Contact Form, Schedule Form (all in one combined modal)
- Integrates: MortgageCalculator, NegotiationAssistant, LiveabilityScore

### SellerDashboard.jsx
- Fetches /api/users/me and /api/properties/user/stats on mount
- Shows verificationStatus with UI states: unverified/pending/verified/rejected
- Document upload via /api/users/verify
- Stats cards: Total Listings, Total Views
- Clickable listings table ? navigate to property detail

### AdminDashboard.jsx (834 lines)
State: stats, users, properties, verifications, editingItem, loading, error, toast, theme, sidebarOpen, activeTab, selectedProperties, confirmModal, generateCount

Sidebar tabs (collapsible on hover, 80px?280px):
- 'stats' ? Overview: 3 stat cards + AdminAnalytics charts
- 'users' ? Users table: username, email, role badge, joined, edit/ban buttons
- 'properties' ? Property generator + bulk select + property list rows with edit/delete
- 'logs' ? AdminLogs component
- 'verifications' ? Pending seller verifications table with Approve/Reject

Features: theme toggle (dark/light via data-theme attr), confirmModal for destructive actions, inline edit modal for users (username/email/role) and properties (title/location/price)

### AdminEntry.jsx
Route: /bvy-estate (secret)
- Red ShieldAlert icon, "Restricted Access" header
- Login/Register toggle (admin role forced)
- Validates role==='admin' on login response
- Stores in localStorage 'adminUser', calls onAdminLogin(data), navigates to /admin

### MortgageCalculator.jsx
Props: isOpen, onClose, price
- Inputs: Property Price (init=price), Down Payment (init=price*0.2), Interest Rate (init=6.5%), Loan Term (15/20/30 yr)
- Formula: standard EMI = P*r*(1+r)^n / ((1+r)^n - 1)
- Displays monthly payment in gold gradient card

### NegotiationAssistant.jsx
Props: property, isOpen, onClose
- Suggested range: 85%-95% of listing price
- Acceptance probability calculated by offer vs range
- Shows: probability %, discount %, strategy tip, counter-offer suggestion, random negotiation script
- "Try Another Offer" resets analysis

### LiveabilityScore.jsx
Props: property, isOpen, onClose
- 1 second simulated "analysis" loader (setTimeout)
- Randomized amenities: hospitals, schools, gyms, metro, parks
- Displays: overall score (0-100), grade (A+/A/B/C/D), noise/traffic/safety/connectivity badges
- Nearby amenities grid, score breakdown with progress bars
- Score color: =80 ? green, =60 ? purple, else red

### AdminAnalytics.jsx
Props: stats, users, properties
- SVG Donut Chart: User role distribution (buyer=green, seller=blue, admin=gold)
- Animated Bar Chart: Property price ranges (Low/Mid/High/Luxury) using framer-motion

### Toast.jsx
Props: message, type('success'|'error'|'info'), onClose, duration(4000ms)
- framer-motion AnimatePresence with slide-up animation
- Icons: CheckCircle, AlertCircle, Info (colored per type)
- Auto-closes after duration via setTimeout

### AIChat.jsx
- Fixed bottom-right floating button (gold, pulse animation)
- Chat window: loads all properties from /api/properties on mount
- generateAIResponse: keyword matching for city (hyderabad/mumbai/bangalore) and price (under X)
- Returns property names or fallback messages

### TiltCard.jsx
Uses framer-motion useMotionValue/useSpring/useTransform for 3D tilt effect (±15deg)
whileHover: scale 1.05

### TypingText.jsx
Typewriter effect: character-by-character with setInterval (100ms), blinking cursor via Infinity animation

### Footer.jsx
Links: Home, Properties, List Property | About, Careers, Contact | Newsletter subscribe form
Toast on subscribe success

### ErrorBoundary.jsx
Class component, catches render errors, shows error details + Reload button

---

## SERVER ENTRY (index.js)

```js
// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve local images

// Routes
app.use('/api/auth', authRoute);
app.use('/api/properties', propertyRoute);
app.use('/api/admin', adminRoute);
app.use('/api/logs', logsRoute);
app.use('/api/users', usersRoute);

// DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/real-estate')
```

---

## ENVIRONMENT VARIABLES

### server/.env
```
PORT=5000
JWT_SECRET=supersecretjwtkey123
MONGO_URI=mongodb://[user]:[pass]@[atlas-cluster]/realestate?ssl=true&...
```

### client/.env
```
VITE_API_BASE_URL=http://localhost:5000
```
(Actual API calls use Vite proxy: /api ? localhost:5000)

---

## STARTUP COMMANDS

```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev      # nodemon index.js ? http://localhost:5000

# Terminal 2 - Frontend
cd client
npm install
npm run dev      # vite ? http://localhost:5173

# One-time setup scripts (run from server/)
node createAdmin.js       # Creates admin user (admin / admin123)
node seedTelangana.js     # Seeds 12 Telangana properties (WIPES existing)
node seedProperties.js    # Seeds 5 US luxury properties (additive)
```

---

## DEPENDENCIES

### Client (client/package.json)
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.13.0",
  "framer-motion": "^12.34.0",
  "lucide-react": "^0.564.0",
  "vite": "^7.3.1",
  "@vitejs/plugin-react": "^5.1.1"
}
```

### Server (server/package.json)
```json
{
  "express": "^5.2.1",
  "mongoose": "^9.2.1",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.3",
  "multer": "^2.0.2",
  "cors": "^2.8.6",
  "dotenv": "^17.3.1",
  "nodemon": "^3.1.14"
}
```

---

## KNOWN PATTERNS & QUIRKS

1. **Token Header**: Uses `token` (not `Authorization`) header. `verifyToken` reads `req.header('auth-token') || req.header('token')` and strips 'Bearer ' prefix.

2. **Admin vs User localStorage**: Two separate keys: `localStorage.getItem('user')` and `localStorage.getItem('adminUser')`. Admin dashboard always prefers adminUser token.

3. **Image URL handling**: If `img.startsWith('http')` ? use directly. Else ? prepend `http://localhost:5000/uploads/`. This pattern repeated in PropertyCard, SellerDashboard, AdminDashboard.

4. **Property ownership**: `String(property.user._id || property.user) === String(user._id)` — handles both populated object and raw ObjectId string.

5. **Admin route guard**: `/admin` redirects to `/bvy-estate` if `adminUser?.role !== 'admin'`. The secret entry URL is `/bvy-estate`.

6. **AI Description Generation**: Pure backend mock (no external AI API). Returns 3 hardcoded template strings filled with title/location/price. Cycles through them on repeated clicks.

7. **Views counter**: Incremented on every GET /api/properties/:id. No deduplication.

8. **Multer storage**: `uploads/` directory relative to server root. Files named `Date.now() + extension` for properties, `Date.now() + '-verify-' + originalname` for verification docs.

9. **Generate Properties**: Admin can generate N properties from a pool of 12 Telangana templates. Count cycles if N > 12, price varies ±10%.

10. **Delete from ListingDetails**: Uses DELETE /api/properties/:id with NO auth. (Note: security gap — any user can delete any property by ID from the frontend.)

11. **Admin Dashboard Sidebar**: Collapses to 80px icons on desktop, expands to 280px on hover. Mobile shows hamburger toggle. Sidebar text uses CSS variable `--sidebar-opacity` toggled by hover.

12. **Theme Toggle**: AdminDashboard sets `document.body.setAttribute('data-theme', theme)` to switch between dark (default) and light neumorphic themes.

---

## TELANGANA PROPERTY POOL (used in admin generate & seedTelangana.js)

12 properties covering: Jubilee Hills, Banjara Hills, HITEC City, Gachibowli, Kukatpally, Shankarpally, Kompally, Warangal Urban, Secunderabad, Kokapet Financial District, Nizamabad, Madhapur. Prices: ?35L to ?6.5 Cr. All with Unsplash images and detailed descriptions tailored for Telangana/Indian market (HMDA, RERA, Vaastu mentions).

---

## COMPLETE SOURCE FILES SUMMARY

All 35+ source files have been captured. Key file sizes for context:
- AdminDashboard.jsx: 834 lines (largest file)
- ListingDetails.jsx: 296 lines
- SellerDashboard.jsx: 215 lines
- AdminDashboard covers: sidebar nav, stats view (3 cards + charts), users table, properties list with bulk select/generate, activity logs, seller verifications, edit modal, confirm modal
- index.css: 767 lines (complete design system)
- admin.js (routes): 287 lines (full CRUD + generate + verifications)


---

## COMPLETE SOURCE CODE — ALL FILES

---

### FILE: server/index.js
```js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const authRoute = require('./routes/auth');
const propertyRoute = require('./routes/properties');
const adminRoute = require('./routes/admin');
const logsRoute = require('./routes/logs');
const usersRoute = require('./routes/users');

app.use('/api/auth', authRoute);
app.use('/api/properties', propertyRoute);
app.use('/api/admin', adminRoute);
app.use('/api/logs', logsRoute);
app.use('/api/users', usersRoute);

app.get('/', (req, res) => {
    res.send('Real Estate Marketplace API is running');
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/real-estate')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

---

### FILE: server/models/User.js
```js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['buyer', 'seller', 'agent', 'admin'],
        default: 'buyer'
    },
    verificationStatus: {
        type: String,
        enum: ['unverified', 'pending', 'verified', 'rejected'],
        default: 'unverified'
    },
    verificationDocument: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
```

---

### FILE: server/models/Property.js
```js
const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    pincode: { type: String },
    image: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);
```

---

### FILE: server/models/ActivityLog.js
```js
const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
```

---

### FILE: server/routes/verifyToken.js
```js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    let token = req.header('auth-token') || req.header('token');
    if (!token) return res.status(401).send('Access Denied');

    if (token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.user = verified;
        console.log("Verified Token Payload:", verified);
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};
```

---

### FILE: server/routes/verifyAdmin.js
```js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    let token = req.header('auth-token') || req.header('token');
    if (!token) return res.status(401).send('Access Denied');

    if (token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.user = verified;

        if (verified.role !== 'admin') {
            return res.status(403).send('Forbidden: Admins only.');
        }

        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};
```

---

### FILE: server/routes/auth.js
```js
const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ActivityLog = require('../models/ActivityLog');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (username && username.toLowerCase() === 'admin') {
            return res.status(403).json("The username 'admin' is reserved and cannot be registered.");
        }

        if (role === 'admin') {
            return res.status(403).json("You cannot register as an admin through this portal.");
        }

        const allowedRoles = ['buyer', 'seller', 'agent'];
        const assignedRole = allowedRoles.includes(role) ? role : 'buyer';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: assignedRole
        });

        const user = await newUser.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "secretkey",
            { expiresIn: "5d" }
        );

        const { password: pw, ...others } = user._doc;

        await ActivityLog.create({
            user: user._id,
            action: 'User Registered',
            details: `New account created: ${user.username} (${user.role})`
        });

        res.status(200).json({ ...others, token });
    } catch (err) {
        console.error("Register Error:", err);
        const message = err.code === 11000
            ? 'Username or email already exists.'
            : (err.message || 'Registration failed. Please try again.');
        res.status(500).json({ message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            const allUsers = await User.find({}, 'username');
            console.log('All usernames:', allUsers.map(u => u.username));
            return res.status(404).json("User not found!");
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("Wrong credentials!");

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "secretkey",
            { expiresIn: "5d" }
        );

        const { password, ...others } = user._doc;

        await ActivityLog.create({
            user: user._id,
            action: 'User Logged In',
            details: `Successful login by: ${user.username}`
        });

        res.status(200).json({ ...others, token });
    } catch (err) {
        console.error("Login Error Details:", err);
        const message = err.message || 'Internal server error. Please try again.';
        res.status(500).json({ message });
    }
});

module.exports = router;
```

---

### FILE: server/routes/users.js
```js
const router = require('express').Router();
const User = require('../models/User');
const verify = require('./verifyToken');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-verify-' + file.originalname);
    },
});
const upload = multer({ storage });

// Seller uploads verification document
router.post('/verify', verify, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json("No document uploaded");
        const user = await User.findById(req.user.id);
        if (user.role !== 'seller') return res.status(403).json("Only sellers can verify");

        user.verificationDocument = req.file.filename;
        user.verificationStatus = 'pending';
        await user.save();

        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get current user
router.get('/me', verify, async (req, res) => {
    try {
        const user = await User.findById(req.user.id, { password: 0 });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
```

---

### FILE: server/routes/logs.js
```js
const router = require('express').Router();
const ActivityLog = require('../models/ActivityLog');
const verify = require('./verifyToken');

// Get All Logs (Admin Only)
router.get('/', verify, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json("You are not authorized to view logs.");
        }

        const logs = await ActivityLog.find()
            .populate('user', 'username email role')
            .sort({ createdAt: -1 });

        res.status(200).json(logs);
    } catch (err) {
        console.error("Fetch Logs Error:", err);
        res.status(500).json(err);
    }
});

module.exports = router;
```

---

### FILE: server/routes/properties.js
```js
const router = require('express').Router();
const Property = require('../models/Property');
const ActivityLog = require('../models/ActivityLog');
const verify = require('./verifyToken');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); },
});
const upload = multer({ storage });

// Create Property with Image Upload
router.post('/', upload.single('image'), async (req, res) => {
    const { title, description, price, location, user } = req.body;
    const imagePath = req.file ? req.file.filename : req.body.image;

    const newProperty = new Property({
        title, description, price, location,
        user: user || '60d0fe4f5311236168a109ca',
        image: imagePath,
    });

    try {
        const savedProperty = await newProperty.save();
        await ActivityLog.create({
            user: savedProperty.user,
            action: 'Created Property',
            details: `Created listing: "${savedProperty.title}"`
        });
        res.status(200).json(savedProperty);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get All Properties
router.get('/', async (req, res) => {
    try {
        const properties = await Property.find();
        res.status(200).json(properties);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get Single Property (increments views)
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        property.views += 1;
        await property.save();
        res.status(200).json(property);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Seller Stats
router.get('/user/stats', verify, async (req, res) => {
    try {
        const userProperties = await Property.find({ user: req.user.id });
        const totalViews = userProperties.reduce((acc, curr) => acc + (curr.views || 0), 0);
        const totalListings = userProperties.length;
        res.status(200).json({ totalListings, totalViews, properties: userProperties });
    } catch (err) {
        res.status(500).json(err);
    }
});

// AI Description Generator (mock - no external API)
router.post('/generate-description', async (req, res) => {
    const { title, location, price } = req.body;
    const formattedPrice = Number(price).toLocaleString('en-IN');

    const descriptions = [
        `Discover your dream home with this stunning property in ${location}. Priced at Rs.${formattedPrice}, "${title}" offers a perfect blend of modern luxury and Vaastu-compliant comfort. Featuring premium amenities, dedicated parking, and a prime location, this is an opportunity you don't want to miss. Contact us today to schedule a site visit!`,
        `Experience the pinnacle of elegance at "${title}". This exclusive residence in ${location} is a masterpiece of design, available for Rs.${formattedPrice}. With spacious interiors, 24/7 power backup, and breathtaking city views, it redefines premium living in Telangana. A true gem for the discerning homebuyer.`,
        `Prime investment opportunity in ${location}! "${title}" is now on the market for Rs.${formattedPrice}. Whether you're looking for a new family home or a high-yield rental asset in a fast-developing IT corridor, this property checks all the boxes. HMDA approved, clear title, and priced to sell quickly.`
    ];

    res.status(200).json({ descriptions });
});

module.exports = router;
```

---

### FILE: server/routes/admin.js (key sections)
```js
const router = require('express').Router();
const User = require('../models/User');
const Property = require('../models/Property');
const ActivityLog = require('../models/ActivityLog');
const verify = require('./verifyToken');
const verifyAdmin = require('./verifyAdmin');

// GET /api/admin/stats
router.get('/stats', verifyAdmin, async (req, res) => {
    const userCount = await User.countDocuments();
    const propertyCount = await Property.countDocuments();
    const properties = await Property.find();
    const totalValue = properties.reduce((acc, curr) => acc + (curr.price || 0), 0);
    res.status(200).json({ users: userCount, properties: propertyCount, totalValue });
});

// GET /api/admin/users
router.get('/users', verifyAdmin, async (req, res) => {
    const users = await User.find({}, { password: 0 });
    res.status(200).json(users);
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', verify, async (req, res) => {
    const userToDelete = await User.findById(req.params.id);
    await User.findByIdAndDelete(req.params.id);
    if (userToDelete && req.user) {
        await ActivityLog.create({
            user: req.user.id,
            action: 'Deleted User',
            details: `Deleted user: "${userToDelete.username}"`
        });
    }
    res.status(200).json("User has been deleted...");
});

// DELETE /api/admin/properties/:id
router.delete('/properties/:id', verify, async (req, res) => {
    const propToDelete = await Property.findById(req.params.id);
    await Property.findByIdAndDelete(req.params.id);
    if (propToDelete && req.user) {
        await ActivityLog.create({
            user: req.user.id,
            action: 'Deleted Property (Admin)',
            details: `Deleted property: "${propToDelete.title}"`
        });
    }
    res.status(200).json("Property has been deleted...");
});

// POST /api/admin/properties/bulk-delete
router.post('/properties/bulk-delete', verify, async (req, res) => {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json("No IDs provided");
    await Property.deleteMany({ _id: { $in: ids } });
    if (req.user) {
        await ActivityLog.create({
            user: req.user.id,
            action: 'Bulk Deleted Properties',
            details: `Deleted ${ids.length} properties`
        });
    }
    res.status(200).json("Properties deleted successfully");
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updatedUser);
});

// PUT /api/admin/properties/:id
router.put('/properties/:id', async (req, res) => {
    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updatedProperty);
});

// POST /api/admin/generate-properties (verifyAdmin, body: {count: N})
// Picks from pool of 12 Telangana templates, cycles if N > 12, ±10% price variation

// GET /api/admin/pending-verifications
router.get('/pending-verifications', verify, async (req, res) => {
    const users = await User.find({ verificationStatus: 'pending' }, { password: 0 });
    res.status(200).json(users);
});

// PUT /api/admin/verify-seller/:id
router.put('/verify-seller/:id', verify, async (req, res) => {
    const { status } = req.body; // 'verified' or 'rejected'
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: { verificationStatus: status } }, { new: true });
    if (req.user) {
        await ActivityLog.create({
            user: req.user.id,
            action: `Seller ${status === 'verified' ? 'Verified' : 'Rejected'}`,
            details: `Updated verification status for: "${updatedUser.username}"`
        });
    }
    res.status(200).json(updatedUser);
});

module.exports = router;
```

---

### FILE: server/createAdmin.js
```js
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/real-estate');

        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log("Admin user already exists. Username: admin");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const newAdmin = new User({
            username: 'admin',
            email: 'admin@urbanova.com',
            password: hashedPassword,
            role: 'admin'
        });

        await newAdmin.save();
        console.log("Admin created successfully!");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
createAdmin();
// Usage: node createAdmin.js
// Default credentials: admin / admin123
```

---

### FILE: client/src/main.jsx
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
```

---

### FILE: client/src/App.jsx
```jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Home as HomeIcon, PlusSquare, Building2, Search, User, LayoutGrid } from 'lucide-react';
import Home from './pages/Home';
import Properties from './pages/Properties';
import ListingDetails from './pages/ListingDetails';
import AddListing from './pages/AddListing';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import AdminEntry from './pages/AdminEntry';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import About from './pages/About';
import Careers from './pages/Careers';
import Contact from './pages/Contact';

function App() {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authConfig, setAuthConfig] = useState({ view: 'login', role: 'buyer' });
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        const storedAdmin = localStorage.getItem('adminUser');
        if (storedAdmin) setAdminUser(JSON.parse(storedAdmin));
      } catch (err) {
        localStorage.removeItem('user');
        localStorage.removeItem('adminUser');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div style={{ height: '100vh', background: '#000' }}></div>;

  const openAuth = (view = 'login', role = 'buyer') => {
    setAuthConfig({ view, role });
    setShowAuthModal(true);
  };

  const handleLogin = (userData) => {
    if (userData.role === 'admin') {
      localStorage.removeItem('user');
      localStorage.setItem('adminUser', JSON.stringify(userData));
      setUser(null);
      setAdminUser(userData);
      setShowAuthModal(false);
      window.location.href = '/admin';
    } else {
      setUser(userData);
      setShowAuthModal(false);
    }
  };

  const handleAdminLogin = (adminData) => { setAdminUser(adminData); };

  const isAdminView = location.pathname === '/bvy-estate' || location.pathname.startsWith('/admin');

  const handleLogout = () => {
    if (isAdminView) {
      localStorage.removeItem('adminUser');
      setAdminUser(null);
    } else {
      localStorage.removeItem('user');
      setUser(null);
      setShowAuthModal(true);
    }
  };

  return (
    <div className="app">
      <header className="navbar-wrapper">
        <nav className="navbar container">
          <Link to="/" className="logo">Urbanova.</Link>
          <div className="nav-links">
            {isAdminView ? (
              <a href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', textDecoration: 'none' }}>
                <HomeIcon size={18} /> Admin Portal
              </a>
            ) : (
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HomeIcon size={18} /> Home
              </Link>
            )}

            {!isAdminView && (
              <>
                <Link to="/properties" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={18} /> Properties
                </Link>
                {user && (user.role === 'seller' || user.role === 'agent') && (
                  <>
                    <Link to="/add" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PlusSquare size={18} /> List Property
                    </Link>
                    <Link to="/seller" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                      <LayoutGrid size={18} /> {user.role === 'agent' ? 'Agent Dashboard' : 'Dashboard'}
                    </Link>
                  </>
                )}
              </>
            )}

            {isAdminView ? (
              adminUser ? (
                <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border)', color: '#ff6b6b', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  Admin (Logout)
                </button>
              ) : null
            ) : (
              user ? (
                <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  {user.username} (Logout)
                </button>
              ) : (
                <button onClick={() => setShowAuthModal(true)} style={{ background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-primary)', padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px' }}>
                  LOGIN
                </button>
              )
            )}
          </div>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home openAuth={openAuth} user={user} />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/property/:id" element={<ListingDetails user={user} adminUser={adminUser} />} />
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/add" element={user && (user.role === 'seller' || user.role === 'agent') ? <AddListing /> : <Navigate to="/" />} />
        <Route path="/seller" element={user && (user.role === 'seller' || user.role === 'agent') ? <SellerDashboard /> : <Navigate to="/" />} />
        <Route path="/admin" element={adminUser && adminUser.role === 'admin' ? <AdminDashboard /> : <Navigate to="/bvy-estate" />} />
        <Route path="/bvy-estate" element={<AdminEntry onAdminLogin={handleAdminLogin} />} />
      </Routes>
      <Footer />

      {showAuthModal && !user && !loading && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          initialView={authConfig.view}
          defaultRole={authConfig.role}
        />
      )}
    </div>
  );
}

export default App;
```

---

### FILE: client/src/components/AuthModal.jsx
```jsx
import { useState } from 'react';
import { X, User, Mail, Lock } from 'lucide-react';

function AuthModal({ onClose, onLogin, initialView = 'login', defaultRole = 'buyer' }) {
    const [isLogin, setIsLogin] = useState(initialView === 'login');
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: defaultRole });
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isLogin ? 'login' : 'register';

        if (!isLogin && formData.username.toLowerCase() === 'admin') {
            setError("The username 'admin' is reserved. Please choose another.");
            return;
        }

        try {
            const res = await fetch(`/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) {
                const errorMessage = typeof data === 'string' ? data : (data.message || data.error || 'Authentication failed');
                throw new Error(errorMessage);
            }
            localStorage.setItem('user', JSON.stringify(data));
            onLogin(data);
            onClose();
        } catch (err) {
            setError(err.message || 'Something went wrong');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="auth-modal">
                <button className="close-btn" onClick={onClose}><X size={20} /></button>
                <div className="auth-header">
                    <h2>Urbanova.</h2>
                    <p>{isLogin ? 'Welcome Back' : 'Join the Community'}</p>
                </div>
                <div className="auth-tabs">
                    <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Login</button>
                    <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Register</button>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <User size={18} />
                        <input type="text" name="username" placeholder="Username" required onChange={handleChange} />
                    </div>
                    {!isLogin && (
                        <div className="input-group">
                            <Mail size={18} />
                            <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} />
                        </div>
                    )}
                    <div className="input-group">
                        <Lock size={18} />
                        <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
                    </div>
                    {!isLogin && (
                        <div className="role-select">
                            <label>I am a:</label>
                            <div className="role-options">
                                <label className={formData.role === 'buyer' ? 'selected' : ''}>
                                    <input type="radio" name="role" value="buyer" checked={formData.role === 'buyer'} onChange={handleChange} />
                                    Buyer
                                </label>
                                <label className={formData.role === 'seller' ? 'selected' : ''}>
                                    <input type="radio" name="role" value="seller" checked={formData.role === 'seller'} onChange={handleChange} />
                                    Seller
                                </label>
                                <label className={formData.role === 'agent' ? 'selected' : ''}>
                                    <input type="radio" name="role" value="agent" checked={formData.role === 'agent'} onChange={handleChange} />
                                    Agent
                                </label>
                            </div>
                        </div>
                    )}
                    {error && <p className="error-msg">{error}</p>}
                    <button type="submit" className="submit-btn">
                        {isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AuthModal;
```

---

### FILE: client/src/components/PropertyCard.jsx
```jsx
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';

function PropertyCard({ property }) {
    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith('http')) return img;
        return `http://localhost:5000/uploads/${img}`;
    };

    const handleImageError = (e) => {
        e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
    };

    return (
        <Link to={`/property/${property._id}`} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
            <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                {property.image ? (
                    <img
                        src={getImageUrl(property.image)}
                        alt={property.title}
                        onError={handleImageError}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
                        No Image
                    </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '20px', boxSizing: 'border-box' }}>
                    <p className="price" style={{ marginBottom: 0 }}>Rs.{property.price.toLocaleString('en-IN')}</p>
                </div>
            </div>
            <div className="card-content">
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.title}</h3>
                <p className="location" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <MapPin size={14} color="var(--accent)" /> {property.location}
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        View Details <ArrowRight size={14} />
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default PropertyCard;
```

---

### FILE: client/src/components/ErrorBoundary.jsx
```jsx
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', color: '#ff4444', backgroundColor: '#111', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1>Something went wrong.</h1>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#ccc' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button onClick={() => window.location.reload()} style={{ marginTop: '2rem', padding: '1rem 2rem', background: 'var(--accent)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                        Reload Application
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
```

---

### FILE: client/src/components/TiltCard.jsx
```jsx
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React from "react";

const TiltCard = ({ children, className }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        x.set((clientX - left) / width - 0.5);
        y.set((clientY - top) / height - 0.5);
    }

    function handleMouseLeave() { x.set(0); y.set(0); }

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

    return (
        <motion.div
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
            whileHover={{ scale: 1.05 }}
        >
            <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}>
                {children}
            </div>
        </motion.div>
    );
};

export default TiltCard;
```

---

### FILE: client/src/components/TypingText.jsx
```jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const TypingText = ({ text, className, delay = 0 }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => {
            let i = 0;
            const interval = setInterval(() => {
                setDisplayedText(text.substring(0, i + 1));
                i++;
                if (i === text.length) clearInterval(interval);
            }, 100);
            return () => clearInterval(interval);
        }, delay * 1000);
        return () => clearTimeout(timeout);
    }, [text, delay]);

    return (
        <motion.span className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {displayedText}
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>|</motion.span>
        </motion.span>
    );
};

export default TypingText;
```

---

### FILE: client/src/components/Toast.jsx
```jsx
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const toastVariants = {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.95 }
};

const icons = {
    success: <CheckCircle size={20} color="#4caf50" />,
    error: <AlertCircle size={20} color="#e53935" />,
    info: <Info size={20} color="#2196f3" />
};

const colors = { success: '#4caf50', error: '#e53935', info: '#2196f3' };

function Toast({ message, type = 'info', onClose, duration = 4000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => onClose(), duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, pointerEvents: 'none' }}>
            <AnimatePresence>
                {message && (
                    <motion.div variants={toastVariants} initial="initial" animate="animate" exit="exit"
                        style={{
                            background: '#1a1a1a',
                            border: `1px solid ${colors[type] || colors.info}`,
                            borderLeft: `4px solid ${colors[type] || colors.info}`,
                            borderRadius: '8px', padding: '16px 20px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'center', gap: '12px',
                            minWidth: '300px', maxWidth: '400px',
                            pointerEvents: 'auto', color: '#fff'
                        }}
                    >
                        <div style={{ flexShrink: 0 }}>{icons[type] || icons.info}</div>
                        <div style={{ flex: 1, fontSize: '0.95rem', lineHeight: '1.4' }}>{message}</div>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Toast;
```

---

### FILE: client/src/components/Footer.jsx
```jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Toast from './Toast';

function Footer() {
    const [toast, setToast] = useState(null);

    const handleSubscribe = (e) => {
        e.preventDefault();
        setToast({ message: "Thanks for subscribing!", type: "success" });
    };

    return (
        <footer className="footer">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="container footer-content">
                <div className="footer-brand">
                    <Link to="/" className="logo">Urbanova.</Link>
                    <p>Premium Real Estate Marketplace.</p>
                </div>
                <div className="footer-links">
                    <div className="link-group">
                        <h4>Platform</h4>
                        <Link to="/">Home</Link>
                        <Link to="/properties">Properties</Link>
                        <Link to="/add">List Property</Link>
                    </div>
                    <div className="link-group">
                        <h4>Company</h4>
                        <Link to="/about">About Us</Link>
                        <Link to="/careers">Careers</Link>
                        <Link to="/contact">Contact</Link>
                    </div>
                    <div className="link-group" style={{ maxWidth: '300px' }}>
                        <h4>Stay Connected</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Subscribe to our newsletter for the latest premium listings.
                        </p>
                        <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="email" placeholder="Enter your email"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '4px', color: '#fff', flex: 1, fontSize: '0.9rem' }}
                            />
                            <button type="submit" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', boxShadow: 'none', whiteSpace: 'nowrap' }}>Subscribe</button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="footer-bottom container">
                <p>&copy; 2024 Estate Platform. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
```

---

### FILE: client/src/components/AIChat.jsx
```jsx
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your Urbanova AI assistant. Ask me to find properties like '2BHK in Hyderabad under 50 lakhs'.", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [properties, setProperties] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetch('/api/properties')
            .then(res => res.json())
            .then(data => setProperties(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { text: input, sender: 'user' }]);
        setInput('');
        setTimeout(() => {
            const response = generateAIResponse(input, properties);
            setMessages(prev => [...prev, { text: response, sender: 'ai' }]);
        }, 1000);
    };

    const generateAIResponse = (query, props) => {
        const lowerQuery = query.toLowerCase();

        if (['hi', 'hello', 'hey', 'greetings', 'sup'].some(w => lowerQuery.includes(w)) && lowerQuery.length < 20) {
            return "Hello! How can I help you find your dream home today?";
        }

        let matches = props;
        if (lowerQuery.includes('hyderabad')) matches = matches.filter(p => p.location.toLowerCase().includes('hyderabad'));
        if (lowerQuery.includes('mumbai')) matches = matches.filter(p => p.location.toLowerCase().includes('mumbai'));
        if (lowerQuery.includes('bangalore')) matches = matches.filter(p => p.location.toLowerCase().includes('bangalore'));

        if (lowerQuery.includes('under')) {
            if (lowerQuery.includes('300k')) matches = matches.filter(p => p.price <= 300000);
            if (lowerQuery.includes('500k')) matches = matches.filter(p => p.price <= 500000);
            if (lowerQuery.includes('1m')) matches = matches.filter(p => p.price <= 1000000);
        }

        if (matches.length === 0) return "I couldn't find any properties matching your exact criteria.";
        if (matches.length === props.length && !lowerQuery.includes('all')) {
            return "I'm not sure what you're looking for yet. Try 'properties in Hyderabad' or 'under 50 lakhs'.";
        }

        const names = matches.slice(0, 3).map(p => p.title).join(", ");
        const countMsg = matches.length > 3 ? ` and ${matches.length - 3} more` : "";
        return `I found ${matches.length} properties, including: ${names}${countMsg}. Check the Properties page for details!`;
    };

    return (
        <>
            <button className="ai-chat-btn" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={48} strokeWidth={2.5} /> : <Bot size={48} strokeWidth={2.5} />}
            </button>
            {isOpen && (
                <div className="ai-chat-window">
                    <div className="chat-header">
                        <h3>Urbanova AI</h3>
                        <span className="online-indicator"></span>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message ${msg.sender}`}>
                                <p>{msg.text}</p>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input-area">
                        <input type="text" placeholder="Type a message..." value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend}><Send size={16} /></button>
                    </div>
                </div>
            )}
        </>
    );
}

export default AIChat;
```

---

### FILE: client/src/components/AdminLogs.jsx
```jsx
import React, { useState, useEffect } from 'react';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const adminUserStr = localStorage.getItem('adminUser');
                const userStr = localStorage.getItem('user');
                let token = null;
                if (adminUserStr) token = JSON.parse(adminUserStr).token;
                if (!token && userStr) token = JSON.parse(userStr).token;

                if (!token) { setError('No token found. Please log in.'); setLoading(false); return; }

                const res = await fetch('/api/logs', { headers: { 'token': token } });
                if (!res.ok) throw new Error(`Server Error: ${res.status} - ${await res.text()}`);
                const data = await res.json();
                setLogs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    if (loading) return <div>Loading activity logs...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {logs.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No activity logs found.</p>
            ) : (
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>User</th>
                                <th style={{ padding: '1rem' }}>Role</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                                <th style={{ padding: '1rem' }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>{log.user?.username || 'Unknown User'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            background: log.user?.role === 'admin' ? 'var(--accent)' : '#333',
                                            color: log.user?.role === 'admin' ? '#000' : '#fff',
                                            padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem'
                                        }}>
                                            {log.user?.role || 'Deleted'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{log.action}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminLogs;
```

---

### FILE: client/src/pages/Home.jsx
```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import TypingText from '../components/TypingText';
import PropertyCard from '../components/PropertyCard.jsx';
import Toast from '../components/Toast';

function Home({ openAuth, user }) {
    const [featuredProperties, setFeaturedProperties] = useState([]);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetch('/api/properties')
            .then(res => res.json())
            .then(data => {
                const sorted = [...data].sort((a, b) => b.price - a.price).slice(0, 3);
                setFeaturedProperties(sorted);
            })
            .catch(err => console.error("Failed to fetch properties:", err));
    }, []);

    const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } };
    const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

    return (
        <div style={{ overflowX: 'hidden' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <header className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <motion.h1 className="hero-title" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                        Find Your <span style={{ color: 'var(--accent)' }}><TypingText text="Dream Space" delay={0.5} /></span>
                    </motion.h1>
                    <motion.p className="hero-subtitle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                        Premium properties curated for the modern lifestyle. Discover exclusive listings in prime locations.
                    </motion.p>

                    <motion.div className="stats-row" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
                        <div className="stat"><span className="stat-number">1k+</span><span className="stat-label">Premium Listings</span></div>
                        <div className="stat-divider"></div>
                        <div className="stat"><span className="stat-number">50+</span><span className="stat-label">Major Cities</span></div>
                        <div className="stat-divider"></div>
                        <div className="stat"><span className="stat-number">24/7</span><span className="stat-label">Support</span></div>
                    </motion.div>

                    <Link to="/properties">
                        <motion.button className="cta-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
                            Explore Properties <ArrowRight size={20} />
                        </motion.button>
                    </Link>
                </div>
            </header>

            {featuredProperties.length > 0 && (
                <section className="container" style={{ padding: '6rem 2rem' }}>
                    <motion.div className="section-header" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}>
                        <h2>Featured Listings</h2>
                        <p>Explore our most exclusive properties.</p>
                    </motion.div>

                    <motion.div className="grid" variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.1 }} style={{ margin: '0 0 2rem 0' }}>
                        {featuredProperties.map(property => (
                            <motion.div key={property._id} variants={fadeInUp}>
                                <PropertyCard property={property} />
                            </motion.div>
                        ))}
                    </motion.div>

                    <div style={{ textAlign: 'center' }}>
                        <Link to="/properties">
                            <button style={{ background: 'transparent', border: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-primary)', padding: '0.8rem 2rem' }}
                                onMouseOver={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
                                onMouseOut={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-primary)'; }}
                            >View All Listings</button>
                        </Link>
                    </div>
                </section>
            )}

            {(!user || user.role !== 'buyer') && (
                <section className="cta-section">
                    <motion.div className="container" style={{ textAlign: 'center' }} initial={{ opacity: 0, scale: 0.95, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6 }}>
                        <h2>Ready to Sell?</h2>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>List your property with us and reach thousands of potential buyers today.</p>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (!user) openAuth('register', 'seller');
                                else if (user.role !== 'seller') setToast({ message: "You must be registered as a Seller to list properties.", type: "error" });
                                else window.location.href = '/add';
                            }}
                            style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}
                        >
                            List Your Property
                        </motion.button>
                    </motion.div>
                </section>
            )}
        </div>
    );
}

export default Home;
```

---

### FILE: client/src/pages/Properties.jsx
```jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from "../components/PropertyCard.jsx";

function Properties() {
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState('all');

    useEffect(() => {
        fetch('/api/properties')
            .then(res => res.json())
            .then(data => { setProperties(data); setFilteredProperties(data); })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        let result = properties;
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p => p.title.toLowerCase().includes(lowerTerm) || p.location.toLowerCase().includes(lowerTerm));
        }
        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            if (max) result = result.filter(p => p.price >= min && p.price <= max);
            else result = result.filter(p => p.price >= min); // "500000+" case
        }
        setFilteredProperties(result);
    }, [searchTerm, priceRange, properties]);

    return (
        <div className="container">
            <header className="hero" style={{ padding: '3rem 0', background: 'none', textAlign: 'center' }}>
                <h1>Find Your Perfect Home</h1>
                <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>Search listings by location, price, or name.</p>
                <div className="search-bar" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input type="text" placeholder="Search by City, Zip, or Address..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} style={{ margin: 0, paddingLeft: '1rem' }} />
                    </div>
                    <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} style={{ margin: 0, width: '200px' }}>
                        <option value="all">Any Price</option>
                        <option value="0-5000000">Under Rs.50 Lakhs</option>
                        <option value="5000000-10000000">Rs.50L - Rs.1 Cr</option>
                        <option value="10000000-20000000">Rs.1 Cr - Rs.2 Cr</option>
                        <option value="20000000-50000000">Rs.2 Cr - Rs.5 Cr</option>
                        <option value="50000000+">Rs.5 Cr+</option>
                    </select>
                </div>
            </header>

            <section className="grid">
                {filteredProperties.map(property => (
                    <PropertyCard key={property._id} property={property} />
                ))}
                {filteredProperties.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                        <p>No listings found matching your search.</p>
                        {properties.length === 0 && (
                            <Link to="/add"><button style={{ marginTop: '1rem' }}>Create First Listing</button></Link>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Properties;
```

---

### FILE: client/src/pages/AddListing.jsx (key logic)
```jsx
// Props: none (reads user from localStorage)
// Edit mode: receives property via navigate('/add', { state: { property } })
// isEditMode = !!location.state?.property

// State: formData{title,description,price,location,pincode}, file, imageURL, aiSuggestions[], currentSuggestionIndex

// handleAI():
//   - First call: POST /api/properties/generate-description with {title,location,price}
//   - Subsequent calls: cycles through the 3 returned descriptions
//   - Sets formData.description to current suggestion

// handleSubmit():
//   - Creates FormData with all fields
//   - If file: appends file; else if imageURL: appends URL string
//   - Appends user._id from localStorage
//   - POST /api/properties (new) or PUT /api/admin/properties/:id (edit mode — NOTE: uses admin route!)
//   - On success: navigates to /property/:id (edit) or / (new)

// UI: Grid 2-col for price+location, pincode field, image URL + file upload, AI button + textarea
```

---

### FILE: client/src/pages/AdminEntry.jsx
```jsx
// Route: /bvy-estate (secret admin portal entry)
// State: isLogin(true), formData{username,email,password,role:'admin'}
// handleSubmit():
//   - POST /api/auth/login or register
//   - Validates response.role === 'admin' for login
//   - localStorage.setItem('adminUser', JSON.stringify(data))
//   - Calls onAdminLogin(data) then navigate('/admin')
// UI: Full-screen dark page, ShieldAlert icon, "Restricted Access" / "Authorized Personnel Only"
//     Toggle between Login and Register Admin
```

---

### FILE: client/src/pages/About.jsx
```jsx
function About() {
    return (
        <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
            <h1>About Urbanova</h1>
            <p style={{ maxWidth: '600px', margin: '0 auto', color: '#a3a3a3' }}>
                Urbanova is the world's leading premium real estate marketplace. We connect discerning buyers with the most exclusive properties across the globe.
            </p>
        </div>
    );
}
export default About;
```

---

### FILE: client/src/pages/Careers.jsx
```jsx
function Careers() {
    return (
        <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
            <h1>Join Our Team</h1>
            <p style={{ maxWidth: '600px', margin: '0 auto', color: '#a3a3a3' }}>
                We are always looking for passionate individuals to help us redefine the real estate industry. Check back soon for open positions.
            </p>
        </div>
    );
}
export default Careers;
```

---

### FILE: client/src/pages/Contact.jsx
```jsx
function Contact() {
    return (
        <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
            <h1>Contact Us</h1>
            <p style={{ maxWidth: '600px', margin: '0 auto', color: '#a3a3a3', marginBottom: '2rem' }}>Have questions? We'd love to hear from you.</p>
            <div style={{ background: '#141414', padding: '2rem', borderRadius: '12px', display: 'inline-block', border: '1px solid #262626' }}>
                <p>Email: support@urbanova.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Luxury Lane, Beverly Hills, CA</p>
            </div>
        </div>
    );
}
export default Contact;
```

---

### FILE: client/vite.config.js
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

---

### FILE: client/index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet">
    <title>Urbanova - Premium Real Estate</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## COMPLETE CSS DESIGN SYSTEM (index.css - critical sections)

### CSS Variables & Root Tokens
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');

:root {
  /* ---- Color Palette ---- */
  --bg-primary: #000000;
  --bg-secondary: #0a0a0a;
  --bg-card: #111111;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --accent: #fbbf24;
  --accent-hover: #f59e0b;
  --accent-glow: rgba(251, 191, 36, 0.4);
  --border: rgba(255, 255, 255, 0.1);
  --border-strong: rgba(255, 255, 255, 0.2);

  /* ---- Neumorphic Shadows ---- */
  --neu-drop: 8px 8px 16px rgba(0,0,0,0.6), -8px -8px 16px rgba(255,255,255,0.05);
  --neu-drop-sm: 4px 4px 8px rgba(0,0,0,0.5), -4px -4px 8px rgba(255,255,255,0.03);
  --neu-inner: inset 6px 6px 12px rgba(0,0,0,0.6), inset -6px -6px 12px rgba(255,255,255,0.05);
  --neu-active: inset 8px 8px 16px rgba(0,0,0,0.7), inset -8px -8px 16px rgba(255,255,255,0.03);

  /* ---- Glass Effects ---- */
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);

  /* ---- Transitions ---- */
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.15s ease;
  --transition-slow: all 0.5s ease;
}

/* Light Mode Override */
[data-theme="light"] {
  --bg-primary: #e0e5ec;
  --bg-secondary: #d1d9e6;
  --bg-card: #e8edf5;
  --text-primary: #2d3436;
  --text-secondary: #636e72;
  --accent: #007bff;
  --accent-glow: rgba(0, 123, 255, 0.3);
  --border: rgba(0, 0, 0, 0.1);
  --neu-drop: 8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.8);
  --neu-inner: inset 6px 6px 12px rgba(163,177,198,0.6), inset -6px -6px 12px rgba(255,255,255,0.8);
}
```

### Base Reset & Typography
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Outfit', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  transition: background-color 0.4s ease, color 0.4s ease;
}

h1, h2, h3, h4, h5 { font-weight: 700; line-height: 1.2; }
h1 { font-size: clamp(2rem, 5vw, 4rem); }
h2 { font-size: clamp(1.5rem, 3vw, 2.5rem); }
a { text-decoration: none; color: inherit; }

button {
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: var(--transition);
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  background: var(--accent);
  color: #000;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 15px var(--accent-glow);
}

button:hover { background: var(--accent-hover); transform: translateY(-2px); }
button:active { transform: translateY(0); box-shadow: none; }

input, textarea, select {
  width: 100%; padding: 1rem; border-radius: 8px; font-size: 1rem;
  font-family: 'Outfit', sans-serif;
  background: var(--bg-secondary); border: 1px solid var(--border);
  color: var(--text-primary); transition: var(--transition); margin-bottom: 1rem;
  box-shadow: var(--neu-inner);
}
input:focus, textarea:focus, select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
```

### Layout Classes
```css
.container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2.5rem; }

/* Property Card */
.card {
  background: var(--bg-card); border-radius: 16px;
  overflow: hidden; transition: var(--transition);
  border: 1px solid var(--border); box-shadow: var(--neu-drop);
  cursor: pointer;
}
.card:hover { transform: translateY(-8px); box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px var(--border-strong); }
.card .card-content { padding: 1.5rem; }
.card .price { font-size: 1.5rem; font-weight: 800; color: var(--accent); }
```

### Navbar
```css
.navbar-wrapper { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding: 1rem 0;
  background: rgba(0,0,0,0.8); backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border); }
.navbar { display: flex; align-items: center; justify-content: space-between; }
.logo { font-size: 1.6rem; font-weight: 900; color: var(--accent); letter-spacing: -0.03em; }
.nav-links { display: flex; align-items: center; gap: 2rem; font-size: 0.95rem; font-weight: 500; }
```

### Hero Section
```css
.hero-section {
  min-height: 100vh; display: flex; align-items: center;
  padding: 10rem 2rem 6rem;
  background: radial-gradient(ellipse at 20% 50%, rgba(251,191,36,0.05) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(251,191,36,0.03) 0%, transparent 50%);
}
.hero-title { font-size: clamp(3rem, 7vw, 6rem); font-weight: 900; line-height: 1; margin-bottom: 1.5rem; letter-spacing: -0.04em; }
.hero-subtitle { font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 2.5rem; max-width: 600px; }
.cta-button { display: inline-flex; align-items: center; gap: 0.75rem; }
.stats-row { display: flex; align-items: center; gap: 2rem; margin-bottom: 3rem; }
.stat { text-align: center; }
.stat-number { display: block; font-size: 2rem; font-weight: 800; color: var(--accent); }
.stat-label { font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.1em; }
.stat-divider { width: 1px; height: 40px; background: var(--border); }
```

### Neumorphic Utility Classes
```css
.neu-outset { background: var(--bg-card); box-shadow: var(--neu-drop); border-radius: 16px; border: 1px solid var(--glass-border); }
.neu-inset { background: var(--bg-primary); box-shadow: var(--neu-inner); border-radius: 12px; }
.glass-panel { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 16px; }
.glow-orb { position: absolute; width: 150px; height: 150px; border-radius: 50%; filter: blur(60px); background: var(--accent); opacity: 0.15; pointer-events: none; }
```

### Auth Modal
```css
.modal-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; }
.auth-modal { background: var(--bg-secondary); padding: 3rem; border-radius: 20px; width: 100%; max-width: 480px; border: 1px solid var(--border); box-shadow: 0 30px 80px rgba(0,0,0,0.7); position: relative; }
.auth-header { text-align: center; margin-bottom: 2rem; }
.auth-header h2 { color: var(--accent); font-size: 2rem; font-weight: 900; }
.auth-tabs { display: flex; gap: 0.5rem; background: var(--bg-primary); border-radius: 8px; padding: 0.25rem; margin-bottom: 2rem; }
.auth-tabs button { flex: 1; border: none; box-shadow: none; background: transparent; color: var(--text-secondary); padding: 0.75rem; }
.auth-tabs button.active { background: var(--accent); color: #000; border-radius: 6px; }
.input-group { position: relative; display: flex; align-items: center; margin-bottom: 1rem; }
.input-group svg { position: absolute; left: 1rem; color: var(--text-secondary); }
.input-group input { padding-left: 3rem; margin: 0; }
.role-options { display: flex; gap: 1rem; }
.role-options label { flex: 1; text-align: center; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border); cursor: pointer; }
.role-options label.selected { border-color: var(--accent); color: var(--accent); background: rgba(251,191,36,0.1); }
.role-options input[type="radio"] { display: none; }
```

### AI Chat Styles
```css
.ai-chat-btn {
  position: fixed; bottom: 2rem; right: 2rem; z-index: 999;
  width: 65px; height: 65px; border-radius: 50%; padding: 0;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
  box-shadow: 0 8px 25px var(--accent-glow), 0 0 0 0 var(--accent-glow);
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%, 100% { box-shadow: 0 8px 25px var(--accent-glow), 0 0 0 0 var(--accent-glow); }
                   50% { box-shadow: 0 8px 25px var(--accent-glow), 0 0 0 12px rgba(251,191,36,0); } }
.ai-chat-window {
  position: fixed; bottom: 6.5rem; right: 2rem; z-index: 999;
  width: 380px; max-height: 550px; border-radius: 20px;
  background: var(--bg-secondary); border: 1px solid var(--border);
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
}
.chat-messages { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
.message { max-width: 85%; padding: 0.85rem 1.1rem; border-radius: 16px; font-size: 0.95rem; line-height: 1.5; }
.message.ai { background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px 16px 16px 16px; align-self: flex-start; }
.message.user { background: linear-gradient(135deg, var(--accent), var(--accent-hover)); color: #000; border-radius: 16px 4px 16px 16px; align-self: flex-end; font-weight: 600; }
.chat-input-area { display: flex; gap: 0.5rem; padding: 1rem; border-top: 1px solid var(--border); }
.chat-input-area input { margin: 0; border-radius: 10px; }
.chat-input-area button { width: 44px; height: 44px; padding: 0; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
```

### Animations
```css
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.img-zoom-hover img { transition: transform 0.5s ease; }
.img-zoom-hover:hover img { transform: scale(1.05); }
```

### Footer Styles
```css
.footer { background: #050505; border-top: 1px solid var(--border); padding: 4rem 0 2rem; margin-top: 6rem; }
.footer-content { display: grid; grid-template-columns: 1fr 2fr; gap: 4rem; margin-bottom: 3rem; }
.footer-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
.link-group { display: flex; flex-direction: column; gap: 0.75rem; }
.link-group h4 { color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.8rem; margin-bottom: 0.5rem; }
.link-group a { color: var(--text-secondary); font-size: 0.95rem; transition: var(--transition); }
.link-group a:hover { color: var(--accent); }
.footer-bottom { border-top: 1px solid var(--border); padding-top: 2rem; text-align: center; color: var(--text-secondary); font-size: 0.9rem; }
```

---

## DATA FLOW DIAGRAMS

### Registration Flow
```
User fills AuthModal ? POST /api/auth/register
  ? bcrypt.hash(password) ? User.save()
  ? ActivityLog.create('User Registered')
  ? jwt.sign({id, role}, JWT_SECRET, '5d')
  ? Returns { _id, username, email, role, verificationStatus, token }
  ? localStorage.setItem('user', JSON.stringify(data))
  ? App.handleLogin() ? setUser() ? closes modal
```

### Login Flow
```
User fills form ? POST /api/auth/login
  ? User.findOne({username})
  ? bcrypt.compare(password, user.password)
  ? ActivityLog.create('User Logged In')
  ? jwt.sign({id, role}) ? Returns user + token
  ? If role === 'admin': localStorage 'adminUser', redirect /admin
  ? Else: localStorage 'user', close modal
```

### Property Create Flow
```
AddListing.handleSubmit() ? FormData built
  ? POST /api/properties (multipart/form-data)
  ? multer saves file to /uploads if present
  ? Property.save() ? ActivityLog.create('Created Property')
  ? navigate('/')
```

### Admin Verification Flow
```
SellerDashboard: upload doc ? POST /api/users/verify
  ? multer saves to /uploads as 'timestamp-verify-originalname'
  ? User.verificationDocument = filename, verificationStatus = 'pending'

AdminDashboard (verifications tab):
  ? GET /api/admin/pending-verifications
  ? "View Document" link ? http://localhost:5000/uploads/filename
  ? Click Approve/Reject ? PUT /api/admin/verify-seller/:id
  ? User.verificationStatus = 'verified' | 'rejected'
  ? ActivityLog.create('Seller Verified' | 'Seller Rejected')
```

---

## SECURITY NOTES & GAPS

1. **DELETE /api/properties/:id** — NO auth middleware. Anyone knowing a property `_id` can delete it.
2. **POST /api/properties** — NO auth middleware. Anyone can create a listing.
3. **JWT_SECRET** hardcoded fallback: `'secretkey'`. Production must set env var.
4. **Admin routes** use `verifyAdmin` but several use only `verify` (e.g., delete user, verify-seller).
5. **CORS**: `app.use(cors())` — accepts all origins. Should lock down in production.
6. **Password in response**: `_doc` destructuring strips password in auth routes. Verify GET /me also excludes it (uses `{password: 0}` projection).

---

## FUTURE IMPROVEMENT ROADMAP

1. **Cloud Image Storage**: Replace local `/uploads` with Cloudinary or AWS S3.
2. **Real AI Integration**: Replace mock `/generate-description` and AIChat with OpenAI/Gemini API.
3. **Auth Security**: Move JWT to httpOnly cookies; add refresh tokens; rate limiting on auth routes.
4. **Fix DELETE Security**: Add `verifyToken` + ownership check to `DELETE /api/properties/:id`.
5. **Real Map Integration**: Replace Mapbox gif placeholder with Leaflet.js or Google Maps embed.
6. **Advanced Search**: Add sqft, bedrooms, property type, distance-based filtering.
7. **Wishlist/Favorites**: Add saved properties for buyers.
8. **Notifications**: Email notifications for verification status changes.
9. **Pagination**: Add server-side pagination to `/api/properties` and admin tables.
10. **Image Gallery**: Support multiple images per property.

# Gifty - Gift Review App

A beautiful, ergonomic web app for reviewing gift ideas with like/dislike/superlike actions.

## 🎯 Features

### Home Page (Public - No Key Required)
- **Gift review queue** with smooth animations
- **Keyboard shortcuts**: L (Like), D (Dislike), S (Superlike)
- **Progress tracking** with visual progress bar
- **Large, clear cards** with product images and prices
- **Ergonomic button layout** with emoji indicators
- Falls back to demo products if none exist

### Admin Page (Requires Access Key)
- **Key request form** with email instructions
- **Add products** with name, price, image URL, and affiliate link
- **View all products** in a responsive grid
- **Beautiful empty states** and loading indicators
- **Form validation** and error handling

## 🔑 Access Key

The hardcoded admin access key is:
```
550e8400-e29b-41d4-a716-446655440000
```

Users request access by emailing: **aziz.belkhir.aziz@gmail.com**

## 🚀 Quick Start

### 1. Install dependencies
```powershell
npm install
```

### 2. Run locally
```powershell
npm run dev
```

Visit **http://localhost:5173**

## 📱 User Flow

1. **Home page** - Anyone can review gifts (no key needed)
2. **Admin page** - Shows key request form if no access
3. **Enter key** - Cookie stored for 30 days
4. **Admin panel** - Add and manage products
5. **Products appear** - In review queue automatically

## 🎨 UI Highlights

### Review Page
- Clean, centered layout (max-width 2xl)
- Large product cards with aspect-ratio images
- Three prominent action buttons with emojis
- Real-time progress bar
- Smooth transitions and animations
- Keyboard-first design

### Admin Page
- Card-based layout with shadows
- Organized form with labels
- Responsive grid (2 cols on tablet, 3 on desktop)
- Product cards with hover effects
- Badge showing product count
- Clear empty states

## 🌐 Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Environment variables (optional):
   - `BASIC_AUTH_USER` (if you want additional protection)
   - `BASIC_AUTH_PASS`
   - `ENCRYPTION_KEY` (for future affiliate key encryption)
   - `NEXT_PUBLIC_SUPABASE_URL` (for persistence)
   - `SUPABASE_SERVICE_ROLE_KEY`

4. Deploy!

## 🎯 Testing Locally

1. Open http://localhost:5173 - see demo products
2. Click through reviews with L/D/S keys
3. Visit `/admin` - see key request form
4. Enter key: `550e8400-e29b-41d4-a716-446655440000`
5. Add a product with image URL
6. Return to home - see your product in queue

## 📁 Architecture

```
app/
  ├── page.tsx              # Public review queue
  ├── admin/page.tsx        # Admin with key protection
  ├── api/
  │   ├── products/route.ts # GET/POST products
  │   ├── ratings/route.ts  # POST ratings
  │   └── auth/
  │       ├── check-key/    # Check if key valid
  │       └── validate-key/ # Validate and set cookie
  ├── layout.tsx            # Navigation (Review, Admin)
  └── globals.css           # Tailwind + custom styles

components/
  └── ProductCard.tsx       # Reusable product display

middleware.ts              # Only protects /admin (minimal)
```

## 🔧 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zod** (validation)
- **In-memory storage** (ready for Supabase)

## 💡 Design Decisions

1. **Public review page** - No barriers to trying the app
2. **Key in admin only** - Protect content management, not consumption
3. **Keyboard-first** - Fast reviews with L/D/S shortcuts
4. **Demo fallback** - Always something to review
5. **Cookie-based auth** - Simple, persistent (30 days)
6. **Single key** - Easy to share with trusted users
7. **Ergonomic UI** - Large targets, clear feedback, smooth animations

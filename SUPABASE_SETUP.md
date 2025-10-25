# Supabase Setup Guide

## Prerequisites
- A Supabase account (https://supabase.com)
- A Supabase project created

## Step 1: Create the Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute the SQL

This will create:
- `products` table - stores gift products
- `reactions` table - stores user ratings/reactions
- Indexes for performance
- Row Level Security policies

## Step 2: Get Your Supabase Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in the project root (or copy from `.env.example`)
2. Add your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Other required variables
ENCRYPTION_KEY=replace-with-32-byte-base64-key
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=your-secure-password
```

## Step 4: Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Go to the Admin page and add a product
3. Go to the Discover Gifts page and rate a product
4. Check your Supabase dashboard:
   - **Table Editor** → `products` - should show your added product
   - **Table Editor** → `reactions` - should show your rating

## Database Schema

### Products Table
- `id` - UUID (auto-generated)
- `name` - Product name
- `price` - Price as text (e.g., "$29.99")
- `image_url` - URL to product image
- `product_link` - Affiliate/merchant link
- `occasions` - Array of occasion tags
- `relationships` - Array of relationship tags
- `age_ranges` - Array of age range tags
- `created_at` - Timestamp
- `updated_at` - Timestamp (auto-updated)

### Reactions Table
- `id` - UUID (auto-generated)
- `session_id` - Anonymous user session identifier
- `product_id` - Reference to product (stored as text for flexibility)
- `reaction` - One of: 'like', 'dislike', 'superlike'
- `occasions` - Array of user-selected occasions
- `relationships` - Array of user-selected relationships
- `age_ranges` - Array of user-selected age ranges
- `created_at` - Timestamp

## Fallback Behavior

The app will automatically fall back to in-memory storage if:
- Supabase credentials are not configured
- Supabase connection fails
- Any database operation fails

This ensures the app continues to work even without a database connection.

## Querying Data

You can query your data in Supabase:

```sql
-- Get all products with their reaction counts
SELECT 
  p.id,
  p.name,
  p.price,
  COUNT(CASE WHEN r.reaction = 'like' THEN 1 END) as likes,
  COUNT(CASE WHEN r.reaction = 'superlike' THEN 1 END) as superlikes,
  COUNT(CASE WHEN r.reaction = 'dislike' THEN 1 END) as dislikes
FROM products p
LEFT JOIN reactions r ON p.id::text = r.product_id
GROUP BY p.id, p.name, p.price
ORDER BY p.created_at DESC;

-- Get most popular occasions
SELECT 
  unnest(occasions) as occasion,
  COUNT(*) as count
FROM reactions
WHERE array_length(occasions, 1) > 0
GROUP BY occasion
ORDER BY count DESC;

-- Get user sessions with most reactions
SELECT 
  session_id,
  COUNT(*) as total_reactions,
  COUNT(CASE WHEN reaction = 'superlike' THEN 1 END) as superlikes,
  COUNT(CASE WHEN reaction = 'like' THEN 1 END) as likes,
  COUNT(CASE WHEN reaction = 'dislike' THEN 1 END) as dislikes
FROM reactions
GROUP BY session_id
ORDER BY total_reactions DESC;
```

## Security Notes

- The `service_role` key has full database access - never expose it in client-side code
- The `anon` key is safe to use in the browser
- Row Level Security (RLS) is enabled for both tables
- Session IDs are stored in httpOnly cookies for privacy

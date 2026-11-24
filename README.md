# 🎁 Gift Basket - Luxury Hampers & Curated Gifts

A modern full-stack web application with **Supabase Authentication & Real-time Database integration**, built with **React 19**, **TypeScript**, and **Vite**.

---

## ✨ Features

- **🔐 Supabase Authentication**:
  - User Sign Up with full name, phone number, email, and secure password.
  - User Sign In with instant session management.
  - Forgot password / reset link flow.
  - Auto-confirmation configured for immediate sign-in.
- **🗄️ Supabase Database Integration**:
  - `public.profiles`: Stores user profiles linked directly to `auth.users` with Row Level Security (RLS) and automatic triggers.
  - `public.saved_baskets`: Real-time table storing personalized gift hampers, recipient names, custom gift messages, and prices.
- **👑 Curated Gift Baskets**:
  - Luxury & Gourmet hampers, Spa & Wellness retreats, Artisanal chocolates, and Festive vineyard celebrations.
  - Interactive "Personalize & Save" modal to customize hampers and store directly into Supabase.
- **⚡ Modern Responsive UI**:
  - Dark luxury aesthetic with gold accents and glassmorphism.
  - Real-time Supabase connection indicator.

---

## 🚀 Supabase Configuration

This project is connected to Supabase project:
- **Project Ref**: `mnyfykhimdkigzcezlov`
- **Project URL**: `https://mnyfykhimdkigzcezlov.supabase.co`

### Database Tables Created

1. **`public.profiles`**:
   - `id` (uuid, references `auth.users`)
   - `email` (text)
   - `full_name` (text)
   - `phone` (text)
   - `avatar_url` (text)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

2. **`public.saved_baskets`**:
   - `id` (uuid)
   - `user_id` (uuid, references `auth.users`)
   - `basket_name` (text)
   - `recipient_name` (text)
   - `custom_message` (text)
   - `price` (numeric)
   - `status` (text)
   - `created_at` (timestamptz)

---

## 🛠️ Getting Started Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://mnyfykhimdkigzcezlov.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ueWZ5a2hpbWRraWd6Y2V6bG92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MTg3ODMsImV4cCI6MjExMTA5NDc4M30.v3btrRhRGBnHeoj5Sx9ihJhHiXp7LMwAFBnkOzjTIDY
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

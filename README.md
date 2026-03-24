# ☕ Chase

Chase the Caffeine. A premium, modern web application for **Chase Coffee**, built with Next.js and Supabase.

![Chase Screenshot](/public/CHASELOGO.png)

## ✨ Features

- 🌓 **Dynamic Theming:** Seamless transition between light and dark modes with persistent preferences.
- 🛒 **Interactive Menu:** A fluid, real-time ordering experience for coffee and specialty drinks.
- 🚚 **Fast Delivery Tracking:** Built-in distance calculations and order status monitoring.
- 🔐 **Admin Dashboard:** Comprehensive management suite for inventory, order queues, and partner relations.
- 🤝 **Partner Ecosystem:** A showcase for local collaborators and businesses.
- 📜 **Digital Catering:** Interactive PDF viewer for catering menus and special events.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Database:** [Supabase](https://supabase.com/) (Real-time DB & Auth)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Visuals:** [Three.js](https://threejs.org/) (React Three Fiber)
- **Styling:** Vanilla CSS with a focus on Glassmorphism and modern aesthetics.

## 🚀 Getting Started

### Prerequisites

- Node.js installed
- A Supabase project

### Setup

1. **Clone and Install:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env.local` file in the root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Database Initialization:**
   Run the SQL scripts located in `supabase/queries/` via the Supabase SQL Editor in the following order:
   - `schema.sql`
   - `partners.sql`
   - `contact-messages.sql`
   - `fix-db.sql`

4. **Run Locally:**
   ```bash
   npm run dev
   ```

## 📂 Project Structure

- `src/app/`: Next.js pages and layouts (Home, Order, Admin, Partners, Catering).
- `src/components/`: Modular UI components (Navigation, Background, Viewers).
- `src/lib/`: Context providers (Cart, Supabase, Theme) and utility functions.
- `supabase/queries/`: SQL scripts for database setup and management.

---

Built with ❤️ for CHASE.

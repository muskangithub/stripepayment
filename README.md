# Premium E-commerce Platform with Social Proof

A high-performance, full-stack e-commerce application built with Next.js, Hono, Drizzle ORM, and Stripe. This project features a premium UI transformation with glassmorphism, social proof integration (reviews, testimonials, Q&A), and a robust backend.

## 🚀 Key Features

### 💎 Premium UI/UX
- **Modern Design**: Sleek glassmorphism aesthetic applied across all components.
- **Micro-animations**: Smooth transitions, hover effects, and float animations for a premium feel.
- **Responsive Layout**: Optimized for all devices from mobile to desktop.

### 🤝 Social Proof & Trust
- **Customer Reviews**: Dynamic review system with star ratings and detailed feedback.
- **Product Q&A**: Interactive accordion-based Q&A section for community engagement.
- **Testimonial Slider**: Beautifully designed customer success stories.
- **Trust Signals**: Animated stats counters and logo clouds for partner verification.

### 🛡️ Robust Backend
- **Type-Safe API**: Built with Hono and Zod for reliable endpoint validation.
- **Drizzle ORM**: High-performance database interactions with PostgreSQL.
- **Stripe Integration**: Secure payment processing with automatic cart clearing on success.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+, React, Tailwind CSS, Lucide Icons.
- **Backend**: Hono (Node.js), Drizzle ORM, PostgreSQL.
- **Styling**: Vanilla CSS + Tailwind Utility Classes.
- **Persistence**: PostgreSQL hosted with Drizzle for schema management.

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies for both parts:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Set up environment variables (.env) in both directories.
4. Run migrations and seed:
   ```bash
   cd backend && npm run db:push && npm run seed
   ```
5. Start the development servers:
   ```bash
   # In separate terminals
   cd frontend && npm run dev
   cd backend && npm run dev
   ```

## 📄 License
MIT

# Viral Zoom

Viral Zoom is a subscription sharing marketplace platform built with Next.js, Supabase, and Tailwind CSS. It connects sellers of digital subscriptions (like Netflix, Spotify) with buyers looking for cheaper shared slots.

## Key Features

- **Hybrid Marketplace**: Supports both Peer-to-Peer (P2P) selling and Admin-managed reselling.
- **Manual Payment System**: Designed for markets where automated gateways (Stripe) are difficult. Supports Bank Transfer and Crypto with proof-of-payment verification.
- **Free Trial Funnel**: "Oxaam-style" marketing funnel to offer free trials that upsell to paid subscriptions.
- **Role-Based Access**: Distinct dashboards for Buyers, Sellers, and Admins.
- **Ledger System**: Double-entry bookkeeping to track user balances and platform fees.

## 🚀 Getting Started

We have prepared a comprehensive, step-by-step guide to help you set up this project from scratch.

👉 **[Read the Complete Setup Guide](docs/SETUP_GUIDE.md)** 👈

### Quick Summary

1.  **Clone the repo**: `git clone ...`
2.  **Install dependencies**: `npm install`
3.  **Setup Supabase**: Run the SQL schema provided in `supabase/schema.sql`.
4.  **Configure Environment**: Create `.env.local` with your Supabase keys.
5.  **Run Locally**: `npm run dev`

## Tech Stack

-   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide React
-   **Backend**: Supabase (PostgreSQL, Auth, Storage)
-   **Language**: TypeScript

## Project Structure

-   `app/`: Next.js App Router pages and API routes.
-   `components/`: Reusable UI components.
-   `lib/`: Helper functions and Supabase client.
-   `supabase/`: Database schema and migration files.
-   `types/`: TypeScript type definitions.
-   `verification/`: Scripts for verifying frontend functionality.

## License

Private / Proprietary.

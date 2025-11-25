# Viral Zoom - Setup & Operations Guide

Welcome to the comprehensive setup guide for **Viral Zoom**, your subscription sharing marketplace. This guide covers everything from zero to a live, functioning website.

## Prerequisites

Before you begin, ensure you have the following:

1.  **Node.js Installed**: Download from [nodejs.org](https://nodejs.org/). (Version 18 or higher recommended).
2.  **Code Editor**: VS Code is recommended.
3.  **Supabase Account**: Sign up at [supabase.com](https://supabase.com) (Free tier is sufficient).
4.  **GitHub Account**: For hosting your code.
5.  **Vercel Account**: For hosting the website (Free tier).

---

## Step 1: Database Setup (Supabase)

The heart of Viral Zoom is the database. We need to create tables to store users, listings, and orders.

1.  **Create a Project**:
    *   Log in to Supabase and click **"New Project"**.
    *   Name it `viral-zoom`.
    *   Set a strong database password (save this!).
    *   Choose a region close to your target audience (e.g., Singapore or Mumbai for Pakistan).

2.  **Run the Database Schema**:
    *   Once the project is created, go to the **SQL Editor** (icon on the left sidebar).
    *   Click **"New Query"**.
    *   Copy the **entire content** of the file located in your project at `viral-zoom/supabase/schema.sql`.
    *   Paste it into the SQL Editor on Supabase.
    *   Click **Run** (bottom right).
    *   *Success Check*: You should see "Success" in the results.

3.  **Get API Keys**:
    *   Go to **Project Settings** (gear icon) -> **API**.
    *   You will need two values later:
        *   `Project URL`
        *   `anon` `public` key.

---

## Step 2: Local Installation

Now, let's get the code running on your computer.

1.  **Navigate to the project folder**:
    Open your terminal or command prompt and go to the `viral-zoom` folder.
    ```bash
    cd viral-zoom
    ```

2.  **Install Dependencies**:
    Download all the necessary libraries.
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    *   Create a new file named `.env.local` in the `viral-zoom` folder.
    *   Paste the following content, replacing the placeholders with your Supabase keys from Step 1.

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
    ```

4.  **Run the App**:
    ```bash
    npm run dev
    ```
    *   Open your browser and go to `http://localhost:3000`.
    *   You should see the Viral Zoom homepage!

---

## Step 3: Admin Account Setup

By default, every new user is a "Buyer". You need to manually make yourself an "Admin".

1.  **Register**:
    *   Go to `http://localhost:3000/auth/register`.
    *   Sign up with your email and password.

2.  **Grant Admin Rights**:
    *   Go back to your **Supabase Dashboard**.
    *   Go to the **Table Editor** (icon on the left).
    *   Open the `profiles` table.
    *   Find your user row.
    *   Change the `role` column from `buyer` to `admin`.
    *   Click **Save** (if needed).

3.  **Verify**:
    *   Refresh your website.
    *   You should now see an "Admin Dashboard" link in the navbar (or access via `/dashboard/admin`).

---

## Step 4: Configure Payment Methods

As an Admin, you need to set up where users will send money.

1.  Go to **Admin Dashboard** -> **Manage Payments** (Create this page if not linked, or check database).
    *   *Note*: The MVP handles payment methods via the database `payment_methods` table.

2.  **Add Methods via Supabase (Quickest)**:
    *   Go to Supabase Table Editor -> `payment_methods`.
    *   Click **Insert Row**.
    *   **Example Bank Transfer**:
        *   `title`: Bank Transfer (Meezan Bank)
        *   `type`: `bank`
        *   `details`: `{"bank_name": "Meezan Bank", "account_number": "0101...", "account_title": "Viral Zoom"}`
        *   `is_active`: `TRUE`
    *   **Example Crypto**:
        *   `title`: USDT (TRC20)
        *   `type`: `crypto`
        *   `details`: `{"wallet_address": "Txyz...", "network": "TRC20", "qr_code_url": "https://link-to-your-qr-image.com"}`

---

## Step 5: How the Funnel Works (Oxaam Style)

We implemented a "Free Trial Funnel" to attract users.

1.  **Create a Paid Listing (The Upsell)**:
    *   Log in as a Seller (or create a new account and set role to `seller` in DB).
    *   Go to **Seller Dashboard** -> **Add Listing**.
    *   Create a "Netflix Premium 1 Month" for 500 PKR.

2.  **Create a Free Trial Listing (The Hook)**:
    *   Go to **Add Listing** again.
    *   Check **"Is this a Free Trial / Giveaway?"**.
    *   Set name: "Netflix 2-Day Free Trial".
    *   **Upsell Linked Listing**: Select the "Netflix Premium 1 Month" you just created.
    *   Submit.

3.  **User Experience**:
    *   A user sees the "Free Trial".
    *   They click **"Claim Free Trial"**.
    *   A popup appears: *"Wait! Why settle for 2 days? Get the full month for only 500 PKR."*
    *   They can choose to upgrade immediately or continue with the free trial.

---

## Step 6: Deploy to Internet (Vercel)

1.  **Push Code to GitHub**:
    *   Create a repository on GitHub.
    *   Push your code there.

2.  **Deploy on Vercel**:
    *   Log in to Vercel.
    *   Click **"Add New..."** -> **Project**.
    *   Import your GitHub repository.
    *   **Environment Variables**:
        *   Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as in your `.env.local`).
    *   Click **Deploy**.

3.  **Done!** Your website is now live.

---

## Operational Workflows

### Approving Listings
1.  Sellers post listings. They appear as "Pending".
2.  Admin goes to `/dashboard/admin/listings`.
3.  Admin checks the proof image and credentials.
4.  Admin clicks **Approve**.

### Verifying Orders
1.  Buyer places an order and uploads a screenshot.
2.  Admin goes to `/dashboard/admin/orders`.
3.  Admin verifies the payment in their real bank/wallet.
4.  Admin clicks **Approve**.
5.  System sends credentials to the Buyer's order page.

### Automatic Expiry
The system has a built-in check for expired listings. To fully automate this, you can set up a Supabase Cron Job (advanced) or just rely on the frontend showing "Expired" status based on the date.

---

## Troubleshooting

*   **Images not loading?** Ensure you are using valid URLs. For production, consider setting up a storage bucket in Supabase and updating the upload logic.
*   **Login not working?** Check your Supabase URL/Key in `.env.local`.
*   **"Table not found" error?** You didn't run the `schema.sql` correctly. Go back to Step 1.

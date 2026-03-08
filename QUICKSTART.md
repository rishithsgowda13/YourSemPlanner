# Quick Start Guide - PlanMySemester

Get the app running in **under 1 hour**! 🚀

## Step 1: Setup Supabase (10 minutes)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project (wait 2-3 minutes for provisioning)
3. Go to **SQL Editor** → Run the SQL from `README.md` line 55-241
4. Go to **Settings** → **API** → Copy:
   - Project URL
   - Project API key (anon/public)

## Step 2: Install Dependencies (5 minutes)

```bash
cd plan-my-semester
npm install
```

## Step 3: Configure Environment (2 minutes)

Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace with your actual values from Step 1.

## Step 4: Run the App (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Test it Out! (5 minutes)

1. Click **Get Started Free**
2. Register with email/password
3. Create task:
   - Title: "DSA Assignment"
   - Due Date: Tomorrow
   - Priority: High
4. Go to Dashboard → see your task
5. Click ✅ to complete → earn points!
6. Check Leaderboard

## Deploy to Vercel (Optional - 10 minutes)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main

# Then:
# 1. Go to vercel.com
# 2. Import GitHub repo
# 3. Add environment variables (same as .env.local)
# 4. Deploy!
```

## Need Help?

Check the main `README.md` for detailed documentation and troubleshooting.

---

**Total Time: ~30-40 minutes** ⚡

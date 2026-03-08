# PlanMySemester - Student Task Manager 🎓

**Anti-procrastination task manager built for students**

Stay focused, earn rewards, ace your exams with AI-powered study assistance.

## 🚀 Features

- ✅ **Today Focus** - Dashboard showing ONLY today's tasks (high → medium → low priority)
- 📝 **Minimal Task Entry** - Just subject, deadline, priority (no complex forms)
- 🔄 **Smart Templates** - Create recurring tasks once (weekly assignments, revision sessions)
- 🎯 **Drag & Drop** - Reschedule tasks between days visually (Coming Soon)
- 📊 **Progress Analytics** - Weekly/monthly completion rate charts (Coming Soon)
- 🏆 **Rewards System** - Points (+10 early, +5 on-time, +2 late), streaks, badges
- 🥇 **Leaderboard** - Weekly/monthly/all-time rankings (Hackerrank-style)
- 🤖 **AI Assistant** - Chat that answers from YOUR uploaded notes (Coming Soon)
- 📅 **Calendar View** - Monthly overview with task counts per day (Coming Soon)

## 📚 Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Postgres, Storage, pgvector)
- **AI**: OpenAI API + pgvector embeddings (Coming Soon)
- **Deployment**: Vercel + Supabase Hosted

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Save your project URL and anon key

### 2. Run Database Schema

Go to **SQL Editor** in Supabase dashboard and run this SQL:

```sql
-- Enable pgvector extension
create extension if not exists vector;

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  points integer default 0,
  streak_count integer default 0,
  last_task_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- RLS Policies for profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  due_date date not null,
  priority text check (priority in ('high', 'medium', 'low')) default 'medium',
  completed boolean default false,
  completed_at timestamp with time zone,
  is_recurring boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table tasks enable row level security;

-- RLS Policies for tasks
create policy "Users can view their own tasks"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Users can create their own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

-- Points log table
create table points_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete cascade,
  points integer not null,
  reason text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table points_log enable row level security;

-- RLS Policies for points_log
create policy "Users can view their own points log"
  on points_log for select
  using (auth.uid() = user_id);

create policy "Users can insert their own points log"
  on points_log for insert
  with check (auth.uid() = user_id);

-- Notes table (for AI assistant)
create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  file_path text not null,
  file_size integer,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table notes enable row level security;

-- RLS Policies for notes
create policy "Users can view their own notes"
  on notes for select
  using (auth.uid() = user_id);

create policy "Users can create their own notes"
  on notes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on notes for delete
  using (auth.uid() = user_id);

-- Note chunks table (for RAG)
create table note_chunks (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references notes(id) on delete cascade not null,
  content text not null,
  embedding vector(1536),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table note_chunks enable row level security;

-- RLS Policies for note_chunks
create policy "Users can view their own note chunks"
  on note_chunks for select
  using (
    exists (
      select 1 from notes
      where notes.id = note_chunks.note_id
      and notes.user_id = auth.uid()
    )
  );

create policy "Users can insert their own note chunks"
  on note_chunks for insert
  with check (
    exists (
      select 1 from notes
      where notes.id = note_chunks.note_id
      and notes.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index tasks_user_id_idx on tasks(user_id);
create index tasks_due_date_idx on tasks(due_date);
create index tasks_completed_idx on tasks(completed);
create index points_log_user_id_idx on points_log(user_id);
create index notes_user_id_idx on notes(user_id);
create index note_chunks_note_id_idx on note_chunks(note_id);
create index note_chunks_embedding_idx on note_chunks using ivfflat (embedding vector_cosine_ops);

-- Functions
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers
create trigger update_profiles_updated_at before update on profiles
  for each row execute procedure update_updated_at_column();

create trigger update_tasks_updated_at before update on tasks
  for each row execute procedure update_updated_at_column();

-- Function to handle new user signup (auto-create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 3. Configure Authentication

In Supabase Dashboard:

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. (Optional) Enable **Google** provider:
   - Create OAuth credentials in Google Cloud Console
   - Add authorized redirect URI: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

### 4. Create Storage Bucket (for AI notes - Coming Soon)

1. Go to **Storage** in Supabase
2. Create bucket named `notes`
3. Set it to **Private**

## 💻 Local Development

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

```bash
# Clone or navigate to project directory
cd plan-my-semester

# Install dependencies
npm install

# Create environment file
copy .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your_project_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# OPENAI_API_KEY=your_openai_key (optional for now)
```

### Running Locally

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Building for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 🌐 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` (optional)
5. Click **Deploy**

### 3. Update Supabase Redirect URLs

In Supabase Dashboard > Authentication > URL Configuration:

- Add your Vercel domain to **Site URL**
- Add `https://YOUR_DOMAIN.vercel.app/**` to **Redirect URLs**

## 📖 Usage Guide

### Creating Your First Task

1. Register/Login
2. Click **Add Task** button
3. Enter:
   - Title: "DSA Assignment"
   - Due Date: Tomorrow's date
   - Priority: High
4. Click **Create Task**

### Completing Tasks & Earning Points

- ✅ Complete task **early** (before due date): **+10 points**
- ✅ Complete task **on time** (on due date): **+5 points**
- ✅ Complete task **late** (after due date): **+2 points**

### Building Streaks

- Complete at least 1 task per day to maintain your streak 🔥
- Streaks will reset if you skip a day without completing tasks

### Competing on Leaderboard

- View rankings: **This Week**, **This Month**, **All Time**
- Top 3 get special badges: 🥇🥈🥉

## 📁 Project Structure

```
plan-my-semester/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/page.tsx       # Today Focus
│   │   ├── tasks/
│   │   │   ├── page.tsx            # All tasks
│   │   │   └── new/page.tsx        # Create task
│   │   ├── leaderboard/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── AuthProvider.tsx
│   │   ├── Navbar.tsx
│   │   └── TaskCard.tsx
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   ├── types.ts               # TypeScript types
│   │   └── utils.ts               # Utility functions
│   └── hooks/
│       └── use-toast.ts
├── public/
├── .env.local.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🎯 Success Criteria Checklist

- [x] Student can register/login
- [x] Add task with minimal form (subject, deadline, priority)
- [x] Tasks appear in Today Focus (prioritized)
- [ ] Drag task to different day (Coming Soon)
- [x] Complete task → gets points
- [x] Streak updates on task completion
- [x] See position on leaderboard
- [ ] Upload PDF notes (Coming Soon)
- [ ] Ask AI questions from notes (Coming Soon)
- [x] Mobile responsive design
- [ ] Deployed on Vercel

## 🛠️ Troubleshooting

### "Supabase client error"
- Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure variables start with `NEXT_PUBLIC_`

### "redirects before Auth Provider is ready"
- This means routing logic runs before auth state loads. Implemented with loading state check

### Google OAuth not working
- Check redirect URI in Google Cloud Console matches Supabase callback URL
- Verify Google provider is enabled in Supabase dashboard

### Tasks not showing
- Check RLS policies are correctly applied in Supabase
- Verify user is authenticated (check browser console for errors)

## 🚧 Roadmap (Coming Soon)

- [ ] Calendar view with drag-and-drop rescheduling
- [ ] Progress analytics charts (Recharts integration)
- [ ] AI Assistant with RAG (upload notes → ask questions)
- [ ] Template library for recurring tasks
- [ ] Badge system for achievements
- [ ] Dark mode toggle
- [ ] Email notifications for upcoming tasks
- [ ] Mobile apps (React Native)

## 📄 License

MIT License - feel free to use for your semester planning!

## 👨‍💻 Built For

First-year CSE students learning Next.js/React. Designed to be:
- ✅ Copy-paste ready
- ✅ Well-documented
- ✅ Production-quality code
- ✅ Learning-friendly structure

---

**Happy Planning! 🎓📚**

Made with ❤️ for students by students

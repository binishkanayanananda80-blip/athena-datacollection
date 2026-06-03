# Leeds International School – Employee Data Collection System

A complete mobile-first web application for Leeds International School to collect employee data for the Athena School Management System.

## Technology Stack
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, shadcn/ui
- **Backend & Database**: Supabase (PostgreSQL, Auth)
- **Deployment**: Vercel

---

## 1. Supabase Setup (Database & Auth)

Since this app requires a secure database, you need to set up a Supabase project.

1. Go to [Supabase](https://supabase.com/) and sign up / log in.
2. Click **New Project**, select your organization, give it a name (e.g. `leeds-athena-data`), and enter a strong database password. Click **Create new project**.
3. Once the project is provisioned, go to the **Project Settings** -> **API**.
4. Copy the `Project URL` and `anon public` key, and `service_role` secret key.

### Run Database Schema & Seed Data
1. In the Supabase Dashboard, go to **SQL Editor** on the left sidebar.
2. Click **New query**.
3. Open `supabase/schema.sql` from this project folder, copy its contents, and paste it into the SQL Editor. Click **Run**.
4. Create another query, copy the contents of `supabase/seed.sql`, paste it, and click **Run**. This will populate all the branches, categories, departments, and designations.

### Set up Admin Login
1. Go to **Authentication** in the Supabase Dashboard.
2. Go to **Users** -> **Add user** -> **Create new user**.
3. Enter the admin email (e.g., `admin@leeds.lk`) and a secure password.
4. Uncheck "Auto Confirm User" if you haven't set up email sending, or manually confirm the user from the interface.

---

## 2. Local Environment Setup

1. Copy the `.env.local.example` file and rename it to `.env.local`.
2. Fill in the values with your Supabase keys:

```ini
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Open a terminal in the project directory and run:
```bash
npm install
npm run dev
```

4. The public form will be accessible at `http://localhost:3000`.
5. The Admin dashboard will be accessible at `http://localhost:3000/admin/login`.

---

## 3. GitHub & Vercel Deployment

1. Create a new repository on [GitHub](https://github.com/) and push this code.
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

2. Go to [Vercel](https://vercel.com/) and click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Before clicking Deploy, expand the **Environment Variables** section and add the 4 variables from your `.env.local` file. 
5. Set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g., `https://leeds-athena.vercel.app`).
6. Click **Deploy**.

---

## 4. Usage Instructions

- **Public Form**: Staff members can fill out the form using their mobile phones or computers. No login is required. Dependent dropdowns ensure data integrity.
- **Admin Dashboard**: Log in with your admin credentials. Here you can view completion statistics, edit master data (add new branches or designations), and download the exact `athena_employee_data_export.csv` required by the Athena system.
- **QR Code**: You can print or share the automatically generated QR code from the Admin Dashboard for staff members to easily access the form.

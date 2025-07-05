# Supabase Setup Guide for KEPH

This guide will help you set up Supabase for KEPH.

## Prerequisites

- A [Supabase](https://supabase.com) account
- Node.js and npm installed
- KEPH project cloned locally

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: KEPH (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
5. Click "Create new project"
6. Wait for the project to be ready (usually 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Project API Key** (anon/public key)

## Step 3: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   
   # Google AI (existing)
   GOOGLE_AI_API_KEY=your-google-ai-key
   
   # Optional: For admin operations
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` and paste it into the editor
4. Click "Run" to execute the schema

This will create:
- All necessary tables (`users`, `categories`, `tasks`, `subtasks`, `task_urls`)
- Enums for task status and recurrence types
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic timestamps
- Functions for user management and search

## Step 5: Configure Authentication

### Enable Email Authentication
1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure email templates if desired

### Enable Google OAuth (Optional)
1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. Add your site URL to authorized domains

### Configure Site URL
1. In **Authentication** → **Settings**
2. Set **Site URL** to your domain (e.g., `http://localhost:3000` for development)
3. Add any additional redirect URLs if needed

## Step 6: Install Dependencies

The Supabase client is already added to the project. If you need to install it manually:

```bash
npm install @supabase/supabase-js
```

## Step 7: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`
3. You should see the authentication form
4. Try creating an account or signing in

## Step 8: Verify Everything Works

1. **Authentication**: Sign up/in with email or Google
2. **Categories**: Create, edit, and delete categories
3. **Tasks**: Create tasks with subtasks and URLs
4. **Real-time Sync**: Open the app in multiple tabs and verify changes sync
5. **Offline Support**: Disconnect internet and verify the app still works

## Troubleshooting

### Common Issues

**"Invalid API key" Error**
- Double-check your environment variables
- Ensure you're using the anon/public key, not the service role key
- Restart your development server after changing `.env.local`

**RLS Policy Errors**
- Ensure the database schema was applied correctly
- Check that RLS is enabled on all tables
- Verify user authentication is working



**Real-time Not Working**
- Check that your Supabase project has real-time enabled
- Verify RLS policies allow the current user to access data
- Check browser console for WebSocket connection errors

### Getting Help

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the browser console for error messages
3. Check the Network tab for failed API requests
4. Verify your environment variables are correct

## Security Notes

- **Never commit** your `.env.local` file to version control
- The anon key is safe to use in client-side code (it's public)
- RLS policies ensure users can only access their own data
- Service role key should only be used server-side if needed

## Performance Tips

- The app uses optimistic updates for better UX
- Real-time subscriptions are automatically managed
- Offline support ensures the app works without internet
- Data is cached locally for faster loading

## Next Steps

- Set up production environment variables for deployment
- Configure custom email templates in Supabase
- Set up monitoring and analytics
- Consider enabling additional auth providers
- Review and customize RLS policies as needed
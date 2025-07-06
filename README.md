# KEPH

KEPH is an intelligent productivity application designed to streamline your task management process. By leveraging the power of AI and cloud synchronization, it helps you create, organize, and track your to-do lists from various inputs like plain text, meeting transcripts, and even your voice.

**🆕 Now with Supabase Integration**: Secure user authentication, real-time synchronization across devices, and robust cloud storage for all your tasks and data.

## ✨ Features

- **🤖 AI-Powered Task Generation**:
  - **Text-to-Tasks**: Describe your plans in plain text, and let the AI generate a structured to-do list for you.
  - **Transcript-to-Tasks**: Paste a meeting transcript, and the AI will identify and extract actionable tasks.
  - **Voice-to-Tasks**: Simply speak your plans, and the app will convert them into a list of tasks.
  - **AI Subtask Generation**: Break down larger tasks into smaller, manageable steps with AI assistance.

- **🗓️ Smart Task Management**:
  - **Intuitive Organization**: View tasks in three distinct categories: "Current," "Completed," and "Pending."
  - **Timeline View**: Tasks are automatically grouped by date, giving you a clear chronological overview of your schedule.
  - **Daily Summaries**: Get a logical, data-driven summary of your progress for any given day, including completion rates.
  - **Search**: Quickly find any task using keywords.
  - **Categories**: Organize tasks with custom categories and color-coded indicators.

- **☁️ Cloud Synchronization**:
  - **Secure Authentication**: Sign up with email/password or Google OAuth.
  - **Real-time Sync**: Changes sync instantly across all your devices.
  - **Offline Support**: Continue working even without internet connection.

- **🎨 Modern & Clean UI**:
  - Built with Next.js, React, ShadCN UI, and Tailwind CSS.
  - A clean, card-based layout that is both responsive and intuitive.
  - A beautiful dark theme that is easy on the eyes.
  - Route-specific authentication with public landing page access.
  - Progressive Web App (PWA) capabilities for mobile installation.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account (free tier available)
- Google AI API key (for AI features)

### Quick Setup

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd KEPH
   npm install
   ```

2. **Set Up Supabase**:
   - Follow the detailed guide in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
   - Create a Supabase project and get your credentials

3. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   GOOGLE_AI_API_KEY=your-google-ai-key
   ```

4. **Run the Application**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
   
   Note: The development server may run on a different port (e.g., 9003) if 3000 is occupied.

5. **First Time Setup**:
   - Visit the landing page to learn about KEPH's features
   - Click "Get Started" or "Sign In" to access the dashboard
   - Create an account or sign in with Google OAuth
   - Start creating tasks and enjoy the AI-powered productivity!

### Development

You can start editing `src/app/page.tsx`. The page auto-updates as you edit the file.

## 📚 Documentation

- **[Supabase Setup Guide](./SUPABASE_SETUP.md)**: Complete setup instructions for database and authentication
- **[Project Blueprint](./docs/blueprint.md)**: Detailed technical architecture and design decisions
- **[Changelog](./CHANGELOG.md)**: Version history and feature updates

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email + Google OAuth)
- **AI**: Google Generative AI (Gemini)
- **Real-time**: Supabase Realtime
- **State Management**: React Hooks + Optimistic Updates

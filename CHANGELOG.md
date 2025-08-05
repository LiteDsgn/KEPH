# Changelog

All notable changes to the KEPH project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Reflective Tone Profile**: Implemented new 'reflective' tone profile option for reports, providing thoughtful and introspective analysis of productivity data
- **Enhanced Report Tone Options**: Expanded tone profile selection from 4 to 5 options (professional, casual, motivational, analytical, reflective) across all system components
- **Reflective AI Guidelines**: Added specialized AI prompt guidelines for generating thoughtful, self-aware content that encourages personal reflection
- **Purple Styling for Reflective Reports**: Implemented distinctive purple color scheme (bg-purple-100 text-purple-800) for reflective tone profile badges
- **Complete Database Schema Support**: Updated SQL enum definitions, TypeScript types, and database schemas to fully support the new reflective profile
- **Enhanced Report Generation with Subtask Analysis**: Implemented comprehensive subtask and URL analysis in report generation, providing deeper insights into task completion patterns and resource utilization
- **Advanced AI Report Analysis**: Enhanced AI prompt schema to include subtask completion rates, task complexity analysis, and resource utilization patterns for more nuanced productivity insights
- **Enriched Task Data Collection**: Updated report generation routes to fetch and include subtasks and URLs alongside tasks, providing richer context for AI analysis
- **Productivity Pattern Analysis**: Added specialized analysis of subtask completion patterns, work context from notes, and engagement depth indicators in generated reports
- **Enhanced Report Content Structure**: Improved report format with dedicated "Productivity Patterns" section and comprehensive analysis guidelines for deeper personal reflection
- **Complete Reports System**: Implemented comprehensive productivity reports feature with AI-powered content generation, timeline interface, and advanced analytics
- **Report Generator Dialog**: Created modal dialog component for report creation with form fields for title, tone profile, and custom date range selection
- **Timeline Interface**: Designed chronological report display with visual timeline, date stamps, and expandable card layout for optimal user experience
- **Report Management API**: Implemented full REST API endpoints (`GET /api/reports`, `POST /api/reports`, `POST /api/reports/generate`, `POST /api/reports/[id]/regenerate`) for report CRUD operations
- **Report Database Schema**: Created reports table with comprehensive fields including title, content, tone profile, date ranges, filters, and user associations with proper indexing and RLS policies
- **Task Category Integration**: Added dynamic category badge display with color coding, automatic category fetching from task data within report date ranges
- **Report Detail Pages**: Implemented individual report view pages with full content display, metadata, and export functionality
- **Navigation Integration**: Added Reports access from main dashboard navigation with dedicated icon and seamless routing
- **Copy Functionality**: Implemented clipboard integration for easy report content sharing and external saving
- **Report Regeneration**: Added AI-powered content regeneration capability to refresh report phrasing while maintaining data consistency
- **Productivity Metrics Display**: Enhanced reports with completion rates, task counts, subtask analysis, and URL resource tracking
- **Five Tone Profiles**: Implemented professional, casual, motivational, analytical, and reflective tone options for personalized report generation
- **Responsive Report Design**: Created mobile-first responsive design with timeline dots, card layouts, and optimized viewing across all devices
- **Report Content Formatting**: Added proper text styling, section organization, and visual hierarchy for enhanced readability
- **Report Search and Filtering**: Implemented search functionality and filtering options for efficient report management
- **Report Analytics Integration**: Connected reports with task analytics for comprehensive productivity insights and trend analysis

### Fixed
- **Authentication Flow**: Fixed various issues in the authentication flow, including redirects, session handling, and middleware bypasses.
- **Reports Data Rendering Issue**: Fixed reports dashboard not displaying calculated statistics (completion rate, completed tasks) by updating frontend to use API endpoint instead of direct Supabase queries
- **Report Statistics Calculation**: Enhanced `/api/reports` endpoint to properly calculate and return `totalSubtasks`, `totalUrls`, `completedTasks`, and `completionRate` for each report
- **Report Type Interface**: Updated `Report` interface in TypeScript to include `completedTasks` and `completionRate` fields for proper type safety
- **Authentication in Reports API**: Resolved authentication issues in reports API calls by implementing proper cookie-based session handling
- **Frontend Data Integration**: Modified reports page to fetch data through API endpoint ensuring all calculated metrics are properly displayed instead of showing "N/A" values

### Removed
- **Test Tasks Functionality**: Completely removed "Test Tasks" button and associated testing components (`TaskFetchTester`, `/api/reports/test-tasks` route) from reports dashboard
- **Public Sharing Features**: Completely removed public sharing functionality from reports system including `is_public` and `description` fields from database schema, frontend interfaces, and UI components
- **Report Shares Table**: Eliminated `report_shares` table and all associated foreign key relationships from database schema
- **Public Sharing UI Elements**: Removed Share button, Public badge, and description field display from report detail pages
- **Report Type References**: Cleaned up remaining `report_type` references and associated UI components from report pages

### Added
- **Comprehensive Timezone Functionality**: Implemented user-specific timezone support with timezone-aware task management, enabling proper "midnight" calculations for daily task transitions
- **Timezone Database Functions**: Added PostgreSQL functions (`get_user_timezone`, `get_user_start_of_day`, `get_user_end_of_day`, `is_today_in_user_timezone`, `is_task_overdue_in_user_timezone`, `get_tasks_due_today`, `get_overdue_tasks`, `transition_daily_tasks`) for server-side timezone calculations
- **Timezone Task Service**: Created `TimezoneTaskService` class with methods for retrieving timezone-aware tasks, handling overdue detection, and managing daily task transitions
- **Timezone Settings Integration**: Enhanced user settings with timezone selection and real-time timezone updates across the application
- **Database Migration Safety**: Implemented proper `DROP FUNCTION IF EXISTS` statements in migration files to prevent PostgreSQL function signature conflicts
- **OAuth Existing User Support**: Implemented comprehensive fallback logic for OAuth authentication to handle existing users who may lack complete profile data
- **Enhanced OAuth Callback Handling**: Added robust user profile detection and creation for existing OAuth users missing database records
- **OAuth Profile Synchronization**: Implemented automatic profile metadata updates during OAuth sign-in to keep user information current
- **OAuth Error Logging**: Added detailed console logging for OAuth callback events, user tracking, and error monitoring
- **Database Consistency Checks**: Enhanced OAuth flow to ensure all users have proper profile records and default categories
- **Automatic Task Transition System**: Implemented automatic daily task management where completed tasks from previous days automatically appear in the "Done" tab when a new day starts
- **Enhanced Task Status Management**: Added logic to both local and Supabase task hooks to handle completed task transitions seamlessly
- **Manual Task Completion Control**: Enhanced "Move to Done" functionality with validation to ensure the option only appears when all subtasks are completed
- **Component Architecture Refactoring**: Extracted monolithic landing page into 14 smaller, maintainable components
- **Advanced Section Extraction**: Created three additional reusable components (`InputCaptureSection`, `FeaturesSection`, `UseCasesSection`) for major page sections
- **Type Safety Enhancement**: Added comprehensive TypeScript interfaces for all component props (`FeatureCardProps`, `PricingCardProps`, `FAQItemProps`, `Testimonial`)
- **Data Layer Separation**: Created dedicated data files for testimonials and other content
- **Reusable UI Components**: Implemented modular components for Header, HeroSection, FeatureCard, PricingCard, FAQItem, TestimonialsCarousel, PricingSection, FAQSection, CTASection, Footer, InputCaptureSection, FeaturesSection, and UseCasesSection
- **Interactive Testimonials Carousel**: Enhanced testimonials section with navigation arrows, pagination dots, and responsive design (1 card on mobile, 2 on tablet, 3 on desktop)
- **Carousel Loop Functionality**: Added seamless infinite scrolling for testimonials carousel
- **Profile Images in Testimonials**: Replaced star ratings with circular avatar images displaying author initials with gradient backgrounds
- Email confirmation screen with professional UI after user signup
- Dedicated "Check Your Email" page with clear instructions and navigation
- Back to Sign In functionality from email confirmation screen
- OAuth callback route handler for Google authentication (`/auth/callback`)
- Email confirmation callback route handler (`/auth/confirm`)
- Authentication error page with user-friendly error messages
- Automatic user record creation in database upon successful OAuth/email verification
- **Route-Specific Authentication**: Implemented dashboard-specific `AuthGuard` in `/dashboard/layout.tsx`
- **Public Page Access**: Enabled guest access to landing page and public routes
- **Improved User Flow**: Updated all authentication buttons to redirect to `/dashboard` instead of `/auth`
- **"General" Category System**: Added "General" as the first, uneditable, unarchivable default category for all task creation
- **Category Protection**: Implemented helper functions `canEditCategory` and `canRemoveCategory` to prevent modification of protected categories
- **Enhanced Category Management**: Improved category ordering to always keep "General" as the first option
- **Custom Scrollbar Styling**: Implemented cross-browser compatible auto-hiding scrollbars with global CSS solution
- **Form Height Management**: Added viewport-based height constraints to prevent forms from growing too tall
- **Smooth Scrolling**: Enhanced user experience with smooth scroll behavior in form sections
- TypeScript strict type checking with comprehensive type annotations
- SpeechRecognition API type definitions for voice input functionality
- Explicit type annotations for React Hook Form components
- Enhanced code quality with proper TypeScript compliance
- Initial project setup with Next.js 15.3.3 and TypeScript
- AI-powered task generation using Google Generative AI (Gemini)
- Text-to-Tasks conversion functionality
- Transcript-to-Tasks processing for meeting notes
- Voice-to-Tasks with speech recognition
- AI subtask generation for complex tasks
- Smart task management with three-category system (Current, Completed, Pending)
- Timeline view with chronological task grouping
- Daily summaries with AI-generated progress reports
- Advanced search functionality across all task categories
- Task editing with in-place form validation
- Manual task creation with rich formatting
- Smart notifications for overdue tasks and progress updates
- Analytics dashboard with completion rate tracking
- Progress visualization using Recharts library
- Modern UI with Tailwind CSS and ShadCN UI components
- Responsive design with mobile-first approach
- Dark theme support
- Supabase integration for secure cloud storage and real-time synchronization
- Comprehensive project documentation and blueprint
- Progressive gradient overlay for contextual menu focus
- Subtle border styling for task item cards
- VisuallyHidden component for improved accessibility compliance
- Enhanced dropdown menu visibility with backdrop blur and stronger shadows
- Responsive panel animations with custom `useResponsiveSheetSide()` hook
- Colored dot indicators for task categories with consistent color generation
- Bottom drawer panels for mobile devices with drag handles
- Right-side panel animations for tablet and desktop devices
- **Custom Command Palette Animation**: Implemented specialized vertical slide animation that moves purely upward from due south position
- **Enhanced Command Palette UX**: Added smooth enter/exit animations with custom cubic-bezier easing and opacity transitions

### Changed
- **Task Hook Logic**: Updated both `use-tasks.ts` and `use-supabase-tasks.ts` to automatically handle completed tasks from previous days, ensuring proper tab filtering without manual intervention
- **Task Filtering Behavior**: Enhanced task management system to seamlessly transition completed tasks to the "Done" tab when a new day begins, maintaining the existing three-tab organization (Current, Done, Pending)
- **Code Organization**: Refactored main landing page from ~330 lines to 63 lines (70% reduction) by extracting components into separate files
- **Major Section Extraction**: Further reduced page.tsx by extracting Input Capture Methods, Features, and Use Cases sections into dedicated components
- **Component Structure**: Improved maintainability with single-responsibility components and clear separation of concerns
- **Import Optimization**: Cleaned up unused imports and dependencies in main page component, removing icon imports now handled by extracted components
- **Authentication Background**: Updated login/signup page background from blue-to-indigo gradient to solid dark color (#0D0D0D) for a more modern, minimalist appearance
- Enhanced user experience with better visual feedback during signup process
- Improved authentication flow with dedicated confirmation states
- Migrated to modern @supabase/ssr package for server-side authentication
- **Increased Character Limits**: Expanded description field character limit from 500 to 1500 characters in text-to-tasks and transcript-to-tasks forms
- **Improved AI Category Assignment**: Enhanced AI prompts to be more insistent on assigning categories to generated tasks with "General" as fallback
- **Default Category for Manual Tasks**: Changed default category from "Personal" to "General" for new manual task creation
- **Form Body Padding**: Optimized form padding from `p-4` to `p-2` for more compact layout in task forms
- **Scrollbar Design**: Replaced complex Tailwind arbitrary values with reusable `custom-scrollbar` CSS class for maintainability
- Enhanced active tab styling with improved visual distinction
- Optimized mobile layout padding for better space utilization
- Removed unnecessary wrapper divs and padding from form components
- Improved task list padding balance for symmetrical layout
- Refined tab styling with brighter backgrounds and instant state changes
- Reduced dropdown menu border opacity from 100% to 20% for subtler appearance
- Enhanced dropdown menu background with 95% opacity and backdrop blur for better content separation
- Upgraded dropdown menu shadow from medium to extra-large for improved visibility
- Reorganized task item layout to display category, date, and recurrence horizontally
- Repositioned task details with date/recurrence on left and category on far right
- Implemented responsive task detail stacking (vertical on mobile, horizontal on larger screens)
- Updated notification and category management panels to use conditional side animations
- Modified panel styling to dynamically adjust height and border radius based on screen size

### Fixed
- **Timezone Service Type Safety**: Resolved TypeScript diagnostic errors in `timezone-task-service.ts` by correcting database function return types and aligning the `TimezoneAwareTask` interface with actual database schema
- **Database Function Schema Alignment**: Fixed type mismatches between database functions (`get_tasks_due_today`, `get_overdue_tasks`) and TypeScript interfaces by updating SQL functions to return `notes` instead of `description` and including all required task fields
- **Settings Save Error Handling**: Enhanced error handling in settings page with detailed logging, input validation, and improved user feedback for timezone-related operations
- **PostgreSQL Function Migration**: Resolved "cannot change return type of existing function" errors by adding proper `DROP FUNCTION IF EXISTS` statements before function recreation
- **Report Generation TypeScript Errors**: Fixed type incompatibility issues in report generation routes where `notes` field was `string | null` from database but expected `string | undefined` by schema
- **Enhanced Report Route Consistency**: Resolved TypeScript errors in regenerate route by updating data structure to include subtasks and URLs, ensuring consistency with main generate route
- **OAuth Existing User Authentication**: Resolved authentication failures for existing OAuth users by implementing fallback user profile creation when database records are missing
- **OAuth Race Condition**: Fixed duplicate user creation attempts between manual logic and database triggers that caused RLS policy violations
- **OAuth Profile Data Gaps**: Eliminated issues where existing users lacked complete profile information or default categories
- **OAuth Session Timing**: Resolved session validation issues that prevented existing users from accessing the application after successful OAuth authentication
- OAuth authentication flow now properly handles callbacks and redirects
- Email verification links now work correctly with proper token handling
- Authentication errors are now displayed in a user-friendly manner
- **Global AuthGuard Issue**: Removed global `AuthGuard` from `layout.tsx` that was preventing guest access to public pages
- **Authentication Routing**: Fixed authentication flow to allow public landing page access while protecting dashboard routes
- **Redundant Auth Checks**: Removed duplicate authentication logic from dashboard page components
- **Build Prerendering Error**: Fixed auth-error page build failure by wrapping useSearchParams() in Suspense boundary
- **Category Visibility Issue**: Fixed "General" category not appearing in UI for users
- **Category Ordering**: Ensured "General" category always appears first in all category lists and selections
- **AI Category Assignment**: Resolved issue where AI-generated tasks were created without categories by enhancing prompts and adding fallback logic
- **Cross-Browser Scrollbar Compatibility**: Resolved scrollbar visibility issues in Chrome by implementing comprehensive CSS solution with Webkit and Firefox support
- **Form Height Overflow**: Prevented task forms from growing too tall by implementing `max-height` constraints (60vh for manual tasks, 70vh for edit tasks)
- **Layout Shifts**: Eliminated scrollbar-induced layout shifts with auto-hiding, thin scrollbar implementation
- **TypeScript Errors**: Resolved all react-hook-form import issues by reinstalling package and adding proper type imports
- **Implicit Type Errors**: Fixed 'any' type errors in form field parameters and event handlers
- **SpeechRecognition Types**: Added comprehensive type definitions for browser speech recognition API
- **Form Component Types**: Added explicit ControllerRenderProps and FieldPath type annotations
- **Modal Force-Closing Issue**: Fixed recurrence panel modal closing unexpectedly when selecting options by enhancing click detection logic in page.tsx
- **Compilation Errors**: Resolved EditTaskForm component export issues and syntax errors in edit-task-form.tsx
- **Border Styling Consistency**: Applied 10% opacity borders to recurrence panel dividers, dropdowns, and calendar popovers for consistent design
- **Dividing Line Opacity**: Updated manual task form dividing line opacity to 30% for better visual hierarchy
- Corrected padding discrepancy between left and right sides in task management area
- Removed jarring transitions from tab state changes for smoother UX
- Resolved DialogContent accessibility error by restructuring DialogTitle placement
- Fixed Daily Summary Dialog layout to ensure DialogDescription appears directly under DialogTitle
- Improved dialog accessibility compliance with proper title and description hierarchy
- **Responsive Panel Behavior**: Improved panel animations to slide from right on web/tablet and bottom on mobile for optimal UX
- **Task Layout Optimization**: Enhanced task item spacing and organization for better readability across all screen sizes
- **TypeScript Test Compilation**: Resolved TypeScript diagnostic errors in `use-supabase-tasks.test.ts` by fixing mock function type casting issues and implementing proper chainable mock objects for Supabase query builder methods
- **Test Mock Structure**: Enhanced test mock setup with explicit type casting for mock functions and created chainable mock objects to properly simulate Supabase's query builder pattern
- **Test Async Handling**: Improved test structure with proper async/await patterns, `waitFor` utilities, and `act` wrappers for React state updates

### Technical Implementation
- Next.js 15.3.3 with App Router and Turbopack
- React 18 with TypeScript 5
- Google Generative AI (Gemini) for AI-powered task generation and report content generation
- Supabase for database, authentication, real-time synchronization, and reports storage
- Tailwind CSS 3.4 with custom design system
- Radix UI components for accessibility
- React Hook Form with Zod validation
- Lucide React icons
- ESLint and PostCSS configuration
- **Reports Architecture**: Comprehensive reports system with AI flow integration (`/src/ai/flows/generate-report.ts`)
- **Report Components**: Modular React components including `ReportGenerator`, timeline interface, and detail pages
- **Report API Layer**: RESTful API endpoints with TypeScript interfaces and Supabase integration
- **Report Database Design**: PostgreSQL schema with enum types, indexes, RLS policies, and automatic timestamp triggers
- **Report Type System**: Complete TypeScript type definitions for reports, tone profiles, and database schemas

### Project Structure
- Component architecture with `/src/components/keph/` and `/src/components/ui/`
- Custom hooks in `/src/hooks/` including Supabase integration
- Type definitions in `/src/types/` with database schemas
- Utility functions in `/src/lib/` including Supabase client
- Authentication and real-time data management
- **Reports System Structure**:
  - `/src/app/reports/` - Reports pages and routing
  - `/src/app/api/reports/` - Report API endpoints and generation routes
  - `/src/components/keph/report-generator.tsx` - Report creation dialog component
  - `/src/ai/flows/generate-report.ts` - AI-powered report generation flow
  - `/docs/reports-feature-prd.md` - Comprehensive reports feature documentation
  - `/reports-data.sql` - Database schema and setup for reports table

### Documentation
- Comprehensive project blueprint
- README with setup instructions
- Development environment configuration
- **Reports Feature Documentation**: Complete PRD with user stories, technical specifications, UI design guidelines, and implementation phases
- **Reports Database Documentation**: SQL schema documentation with usage instructions, RLS policies, and performance optimization
- **Reports API Documentation**: Comprehensive API endpoint documentation with request/response schemas and error handling

---

## How to Use This Changelog

### Categories
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

### Version Format
- Follow semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

### Entry Format
```markdown
## [Version] - YYYY-MM-DD

### Added
- Feature description with context

### Changed
- Modification description with impact

### Fixed
- Bug fix description with issue reference
```

### Guidelines for Contributors
1. Add entries to the "Unreleased" section as you work
2. Include context about why changes were made
3. Reference issue numbers when applicable
4. Group related changes together
5. Use clear, descriptive language
6. Update version numbers when releasing

---

*This changelog helps track the evolution of KEPH and provides context for all development decisions and feature implementations.*
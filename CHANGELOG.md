# Changelog

All notable changes to the KEPH project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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

### Technical Implementation
- Next.js 15.3.3 with App Router and Turbopack
- React 18 with TypeScript 5
- Google Generative AI (Gemini) for AI-powered task generation
- Supabase for database, authentication, and real-time synchronization
- Tailwind CSS 3.4 with custom design system
- Radix UI components for accessibility
- React Hook Form with Zod validation
- Lucide React icons
- ESLint and PostCSS configuration

### Project Structure
- Component architecture with `/src/components/keph/` and `/src/components/ui/`
- Custom hooks in `/src/hooks/` including Supabase integration
- Type definitions in `/src/types/` with database schemas
- Utility functions in `/src/lib/` including Supabase client
- Authentication and real-time data management

### Documentation
- Comprehensive project blueprint
- README with setup instructions
- Development environment configuration

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
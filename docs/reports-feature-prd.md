# Reports Feature - Product Requirements Document (PRD)

## Overview

The Reports feature provides users with productivity reports displayed in a clean timeline format. Reports show task completion data, category insights, and productivity metrics for specified date ranges, helping users track their progress and understand their work patterns.

## Problem Statement

Users need a way to view their productivity data over time in an organized, visual format that shows both high-level metrics and detailed insights about their task completion patterns and category performance.

## Goals & Objectives

### Primary Goals
- Provide users with clear visibility into their productivity patterns over time
- Display task category insights from analyzed time periods
- Present reports in an easy-to-read timeline format
- Enable users to generate custom reports for any date range

### Success Metrics
- User engagement with reports (views, generations, time spent reading)
- Frequency of report generation
- User satisfaction with report insights and usability

## User Stories

### Core User Stories
1. **As a user**, I want to generate productivity reports for custom date ranges so that I can analyze specific time periods.
2. **As a user**, I want to view my reports in a timeline format so that I can see my productivity data chronologically.
3. **As a user**, I want to see task categories from my analyzed time periods displayed as badges.
4. **As a user**, I want to copy report content so that I can share or save it externally.
5. **As a user**, I want to see productivity metrics like completion rates and task counts.

### Advanced User Stories
1. **As a user**, I want to filter and search through my reports.
2. **As a user**, I want to regenerate report content if the current generation doesn't appeal to me.
3. **As a user**, I want to customize the tone profile of my reports.

## Feature Requirements

### Functional Requirements

#### 1. Report Generation
- **Custom Date Range**: Users can specify start and end dates for report analysis
- **Title Input**: Custom report titles for easy identification
- **Tone Profile Selection**: Choose from professional, casual, motivational, or analytical tones
- **Content Generation**: Generate report content based on task data from the specified period

#### 2. Timeline Interface Design
- **Chronological Layout**: Reports displayed in reverse chronological order
- **Visual Timeline**: Central timeline with dots marking each report
- **Date Display**: Clear date and time stamps for each report
- **Card Layout**: Each report displayed in an expandable card format
- **Responsive Design**: Works on desktop and mobile devices

#### 3. Task Category Integration
- **Category Badges**: Display task categories from the analyzed time period as colored badges
- **Dynamic Category Fetching**: Automatically retrieve categories from tasks within the report date range
- **Color Coding**: Different colors for different task categories for easy visual identification
- **Fallback Display**: Show "General" when no task categories are found

#### 4. Report Content Display
- **Productivity Metrics**: Show completion rates, task counts, subtasks, and URLs
- **Report Content**: Display formatted report text with proper styling
- **Category Badges**: Display task categories from the analyzed time period as colored badges


#### 5. Basic Actions
- **Copy Functionality**: Copy report content to clipboard
- **Report Regeneration**: Regenerate report content with different phrasing while maintaining the same data and insights
- **Report Management**: View and organize existing reports

### Non-Functional Requirements

#### Performance
- Report generation should complete within 10 seconds
- Timeline should load smoothly with infinite scroll capability
- AI processing optimized for narrative quality and personal tone

#### Content Quality
- Reports must feel authentically written in the user's voice
- Content should be engaging and story-driven, not data-heavy
- Personal insights should be meaningful and actionable
- Tone should be encouraging and growth-focused

#### Security & Privacy
- Personal productivity narratives contain sensitive reflection data
- User consent required for AI processing of personal task data
- Option to exclude sensitive tasks from narrative generation

## Technical Considerations

### AI Integration & Prompt Engineering
- **Narrative AI Service**: Integration with OpenAI GPT for story generation
- **First-Person Prompts**: Specialized prompts for authentic personal voice
- **Tone Consistency**: Maintain personal, reflective tone across all reports
- **Context Awareness**: Connect current month to previous reports for narrative continuity

### Database Schema
```sql
-- Reports table
CREATE TABLE public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  tone_profile TEXT NOT NULL DEFAULT 'professional',
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  filters JSONB DEFAULT '{}',
  content TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_reports_date_range ON public.reports(date_range_start, date_range_end);
```

### API Endpoints
```
GET /api/reports - List user's reports
POST /api/reports - Create new report
GET /api/reports/:id - Get specific report
DELETE /api/reports/:id - Delete report
PUT /api/reports/:id - Update report
```

## User Interface Design

### Navigation Integration
- Reports accessible from main navigation
- Clean, modern interface with gradient background
- Back navigation to dashboard

### Timeline Page Layout
```
┌─────────────────────────────────────────┐
│ Reports                                 │
│ [Generate] [Search]                     │
├─────────────────────────────────────────┤
│ Timeline Layout:                        │
│                                         │
│ Jan 22, 2024    ● Weekly Productivity  │
│ 10:00 AM         Summary               │
│                 ┌─────────────────────┐ │
│                 │ Report Title        │ │
│                 │ Date Range          │ │
│                 │ [Metrics Grid]      │ │
│                 │ Report Content      │ │
│                 │ [Category Badges]   │ │
│                 │ [Copy] [Share]      │ │
│                 └─────────────────────┘ │
│                                         │
│ Jan 15, 2024    ● Monthly Analysis     │
│ 9:00 AM         [Report Card...]       │
└─────────────────────────────────────────┘
```

### Report Generator Dialog
- Modal dialog with form fields:
  - Report Title (text input)
  - Tone Profile (dropdown: professional, casual, motivational, analytical)
  - Start Date (date picker)
  - End Date (date picker)
- Generate button with loading state

## Implementation Phases

### Phase 1: Core Functionality (Current)
- Report generation with custom date ranges
- Timeline interface with visual design
- Task category integration and badge display
- Basic copy functionality
- Tone profile selection

### Phase 2: Enhanced Features
- Advanced filtering and search
- Export functionality (PDF, markdown)
- Report content regeneration with improved phrasing
- Report editing capabilities

### Phase 3: Analytics and Insights
- Advanced productivity metrics
- Trend analysis across reports
- Comparative insights between time periods
- Integration with external productivity tools

## Content Guidelines

### Report Content Structure
- **Clear Title**: Descriptive title for easy identification
- **Date Range**: Clearly specified analysis period
- **Productivity Metrics**: Completion rates, task counts, category breakdown
- **Content Body**: Formatted text with insights and analysis
- **Category Integration**: Visual representation of task categories from the period

### Tone Profile Options
1. **Professional**: Formal, business-oriented language
2. **Casual**: Relaxed, informal tone
3. **Motivational**: Encouraging, positive language
4. **Analytical**: Data-focused, objective analysis

## Success Criteria

### Launch Criteria
- Users can generate reports for custom date ranges
- Timeline interface displays reports clearly and chronologically
- Task categories are properly fetched and displayed
- Copy and basic share functionality works

### Post-Launch Success Metrics
- 60% of active users generate at least one report within first month
- Average time spent in reports section >2 minutes
- User satisfaction score >4.0/5.0 for report usefulness
- 30% of users generate multiple reports
- Positive feedback on category insights and timeline interface

## Future Considerations

- Advanced analytics and trend analysis
- Integration with external productivity tools
- Team/collaborative reports
- Advanced export formats and customization
- Mobile app optimization
- AI-powered insights and recommendations

---

**Document Version**: 3.0  
**Last Updated**: Current Date  
**Status**: Updated - Reflects Current Implementation
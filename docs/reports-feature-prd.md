# Reports Feature - Product Requirements Document (PRD)

## Overview

The Reports feature provides users with AI-generated monthly productivity articles presented in a personal blog-like timeline format. These first-person narrative reports help users reflect on their accomplishments, understand their work patterns, and celebrate their productivity journey through engaging, story-driven content.

## Problem Statement

Users currently lack visibility into their long-term productivity patterns and achievements. While they can see individual tasks and daily progress, there's no consolidated view that helps them understand their monthly accomplishments, productivity trends, or areas for improvement in a meaningful, engaging format.

## Goals & Objectives

### Primary Goals
- Provide users with personal, first-person reflective insights into their monthly productivity
- Create engaging, blog-style reports that feel like personal journal entries
- Present productivity data as a compelling narrative timeline
- Enhance user engagement through authentic self-reflection and achievement recognition

### Success Metrics
- User engagement with reports (views, generations, copies, time spent reading)
- User retention improvement through emotional connection to their progress
- Time spent in the reports section
- User feedback on report quality, authenticity, and usefulness
- Share rates of personal productivity stories

## User Stories

### Core User Stories
1. **As a user**, I want to generate a personal monthly reflection of my productivity so that I can understand my journey in my own voice.
2. **As a user**, I want to view my reports in a timeline format so that I can see my productivity story unfold chronologically.
3. **As a user**, I want to copy my personal productivity stories so that I can share them with others or save them externally.
4. **As a user**, I want the reports to be written in first-person as if I wrote them myself, so they feel authentic and personal.
5. **As a user**, I want to see both my wins and struggles reflected honestly in my reports.

### Advanced User Stories
1. **As a user**, I want to see how my productivity patterns evolved over time through connected storytelling.
2. **As a user**, I want to export my productivity journey in different formats.
3. **As a user**, I want to customize the tone and focus areas of my personal reports.

## Feature Requirements

### Functional Requirements

#### 1. AI-Powered Personal Narrative Generation
- **First-Person Blog Style**: Generate authentic reports using "I" language that reads like personal journal entries
- **Personal Storytelling**: Create engaging narratives that tell the user's productivity story in their own voice
- **Conversational Tone**: Natural, reflective language like "What a month March has been!"
- **Honest Self-Assessment**: Include both achievements and struggles in an authentic way

**Report Content Structure**:
- Personal introduction setting the tone ("February was really about finding my rhythm...")
- "How I spent my time this month" - weekly task breakdown or grouped related tasks
- "My biggest win this month" highlighting key achievements
- Personal insights about work patterns and discoveries
- "Where I struggled" honest self-reflection
- "What I'm proud of this month" celebration section
- "My plan for next month" forward-looking goals

#### 2. Timeline Interface Design
- **Single-Page Timeline Layout**: Dark-themed chronological layout with full stories expanded inline
- **No Detail Views**: All story content displayed directly on the timeline page
- **Visual Timeline Connector**: Central line with dots marking each report entry
- **Personal Badge System**: Report type indicators (Monthly, Quarterly, etc.)
- **Expandable Story Cards**: Full narrative content displayed in timeline cards
- **Smooth Scrolling Navigation**: Continuous timeline experience through full productivity stories

#### 3. Content Personalization
- **Achievement Highlighting**: Celebrate specific project completions and milestones
- **Pattern Recognition**: Identify and reflect on personal productivity patterns
- **Growth Tracking**: Show evolution and improvement over time in narrative form
- **Challenge Acknowledgment**: Honest discussion of difficulties and areas for improvement
- **Future Planning**: Personal goal setting and intention statements

#### 4. Copy and Share Functionality
- **One-click Copy**: Copy entire personal story to clipboard in markdown format
- **Selective Copy**: Copy specific sections of the personal narrative
- **Social Sharing**: Share personal productivity stories with privacy controls
- **Export Options**: Download personal journey as PDF, markdown, or plain text

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
- Secure sharing with expiration dates for shared personal stories

## Technical Considerations

### AI Integration & Prompt Engineering
- **Narrative AI Service**: Integration with OpenAI GPT for story generation
- **First-Person Prompts**: Specialized prompts for authentic personal voice
- **Tone Consistency**: Maintain personal, reflective tone across all reports
- **Context Awareness**: Connect current month to previous reports for narrative continuity

### Enhanced Database Schema
```sql
-- Reports table with narrative focus
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  narrative_content TEXT NOT NULL, -- First-person blog content
  personal_insights JSONB, -- Key insights in structured format
  achievements JSONB, -- Celebrated wins and milestones
  challenges JSONB, -- Areas of struggle and improvement
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  report_type VARCHAR(50) DEFAULT 'monthly',
  ai_generated BOOLEAN DEFAULT true,
  tone_profile VARCHAR(50) DEFAULT 'reflective', -- Personal tone settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report narrative shares table
CREATE TABLE report_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  share_token VARCHAR(255) UNIQUE NOT NULL,
  share_title VARCHAR(255), -- Custom title for shared story
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Endpoints
```
GET /api/reports - List user's personal productivity timeline
POST /api/reports/generate - Generate new personal narrative report
GET /api/reports/:id - Get specific personal story
DELETE /api/reports/:id - Delete personal report
POST /api/reports/:id/share - Create shareable personal story link
GET /api/reports/shared/:token - Access shared productivity story
POST /api/reports/:id/regenerate - Regenerate with different tone/focus
```

## User Interface Design

### Navigation Integration
- Reports icon in header navigation with notification badge for new personal stories
- Icon: Document/journal icon representing personal productivity stories
- Badge indicator for newly generated personal narratives

### Timeline Page Layout (Single Page with Expanded Stories)
```
┌─────────────────────────────────────────┐
│ Productivity Reports (Dark Theme)       │
│ [Generate New Story] [Search Timeline]  │
├─────────────────────────────────────────┤
│ Filter: [All] [Monthly] [Quarterly]     │
├─────────────────────────────────────────┤
│ Timeline with Full Personal Stories:    │
│                                         │
│ Mar 31, 2024    ● March 2024: Peak     │
│ 11:45 PM         Performance Month     │
│ Monthly Report                          │
│                 ┌─────────────────────┐ │
│                 │ What a month March  │ │
│                 │ has been! I can...  │ │
│                 │                     │ │
│                 │ 📊 Week by week:    │ │
│                 │ Week 1: Focused on  │ │
│                 │ setting up projects │ │
│                 │ Week 2: Marketing   │ │
│                 │ campaign tasks...   │ │
│                 │                     │ │
│                 │ 🎯 My biggest win   │ │
│                 │ [Copy][Share][Export]│ │
│                 └─────────────────────┘ │
│                                         │
│ Feb 29, 2024    ● February 2024:       │
│ 9:12 PM          Building Momentum     │
│ Monthly Report  [Full story card...]    │
└─────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Personal Narrative MVP
- First-person AI narrative generation
- Basic timeline layout with personal stories
- Copy functionality for personal stories
- Monthly reports with authentic voice

### Phase 2: Enhanced Storytelling
- Custom date ranges for personal reflections
- Advanced personal insights and pattern recognition
- Sharing functionality for productivity stories
- Export options with personal branding

### Phase 3: Narrative Intelligence
- Connected storytelling across months
- Personalized tone and style preferences
- Growth narrative tracking
- Community features for sharing productivity journeys

## Content Guidelines

### Writing Style Requirements
- **First-Person Voice**: All content written as "I did this" not "You did this"
- **Conversational Tone**: Natural, personal language like writing in a journal
- **Story Structure**: Beginning, middle, end with narrative flow
- **Emotional Connection**: Celebrate wins, acknowledge struggles honestly
- **Growth Mindset**: Focus on learning and improvement
- **Specific Examples**: Reference actual tasks and projects by name
- **Future Planning**: End with personal intentions and goals

### Content Sections
1. **Personal Introduction** - Setting the tone and overall feeling
2. **Weekly Task Reflection** - "How I spent my time" with week-by-week or grouped task summaries
3. **Achievement Celebration** - "My biggest win" and accomplishments
4. **Pattern Discovery** - Personal insights about work style
5. **Challenge Acknowledgment** - Honest reflection on struggles
6. **Pride Moments** - Specific achievements to celebrate
7. **Forward Planning** - "My plan for next month"

## Success Criteria

### Launch Criteria
- Users can generate authentic first-person monthly narratives
- Reports feel personally written and emotionally engaging
- Timeline provides smooth storytelling experience
- Copy functionality preserves personal narrative format

### Post-Launch Success Metrics
- 70% of active users generate at least one personal story within first month
- Average time spent reading reports >3 minutes (indicating engagement with narrative)
- User satisfaction score >4.5/5.0 for report authenticity
- 40% of users share or export their personal productivity stories
- Users report feeling more connected to their productivity journey

## Future Considerations

- Multi-format storytelling (video summaries, audio reflections)
- Community features for sharing anonymous productivity insights
- Integration with journaling apps and personal reflection tools
- Advanced AI personality matching for writing style
- Year-end "productivity memoir" compilation features

---

**Document Version**: 2.0  
**Last Updated**: Current Date  
**Status**: Updated - Reflects Timeline and Personal Narrative Implementation
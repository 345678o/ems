# Events Calendar Feature

## Overview
The Events Calendar is a comprehensive event management and viewing system that provides both calendar and list views for browsing events.

## Features

### 📅 Calendar View
- Interactive calendar with event indicators
- Click on dates to see events for that day
- Visual event counts and status indicators
- Month navigation

### 📋 List View
- Detailed event information in a list format
- Event cards with complete details
- Sorting and filtering capabilities

### 🔍 Filtering & Search
- Search by event name, description, or venue
- Filter by status (approved, pending, rejected, cancelled)
- Filter by event type (free, paid, workshop, seminar)
- Filter by host (IIC, club, external)

### 📊 Statistics Dashboard
- Total events count
- Approved events count
- Pending events count
- Current month events count

## Pages & Components

### Main Page
- **Location**: `/app/events/page.tsx`
- **Route**: `/events`
- **Description**: Main events calendar page with full functionality

### Components
- **EventsNavigation**: Navigation breadcrumb for events section
- **EventsQuickAccess**: Widget showing upcoming events (can be used in sidebar/dashboard)
- **EnhancedEventCalendar**: Advanced calendar with additional features
- **CalendarIntegration**: Combined view switching between enhanced and admin views

## Usage

### Viewing Events
1. Navigate to `/events`
2. Choose between Calendar or List view
3. Use filters to narrow down events
4. Click on calendar dates or event cards to view details

### Integration in Other Components
```tsx
import { EventsQuickAccess } from "@/components/events-quick-access";

// Add to dashboard or sidebar
<EventsQuickAccess />
```

### Navigation
```tsx
import { EventsNavigation } from "@/components/events-navigation";

// Add breadcrumb navigation
<EventsNavigation />
```

## Data Structure
The calendar works with Supabase events table with the following key fields:
- `id`: Unique identifier
- `name`: Event name
- `description`: Event description
- `start_datetime`: Event start date and time
- `end_datetime`: Event end date and time
- `venue`: Event location
- `status`: Event status (approved, pending, etc.)
- `event_type`: Type of event (free, paid, workshop, etc.)
- `hosted`: Who is hosting (iic, club, external)
- `club_id`: Associated club ID
- `clubs`: Related club information

## Responsive Design
- Mobile-first approach
- Grid layouts that adapt to screen size
- Collapsible filters on smaller screens
- Touch-friendly calendar interface

## Future Enhancements
- Event registration integration
- Export to calendar (ICS format)
- Email reminders
- Event sharing functionality
- Advanced filtering options
- Event analytics
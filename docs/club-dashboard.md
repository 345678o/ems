# Club Dashboard

> Consolidated from `CLUB_PAGE_CHANGES.md`. Updated to reflect the refactored
> component structure.

---

## Overview

The club dashboard at `/club` is built from focused sub-components under
`components/club/` and composes three tabs:

| Tab | Value | Description |
|---|---|---|
| IIC Activities | `iic` | IIC-hosted events assigned to this club |
| Self Driven Activities | `self-hosted` | Events created by the club itself |
| My Calendar Activities | `calendar` | IIC events the club has added to its calendar |

---

## Component Structure

```
app/club/page.tsx                Slim page (~140 lines) — composes everything
components/club/
├── types.ts                     ClubEvent, CalendarEvent interfaces
├── useClubEvents.ts             Data-fetching hook (all Supabase logic)
├── utils.ts                     getDateRangeDisplay, getReportStatus, formatEventDate
├── DateTimePicker.tsx           Date + time popover picker
├── AddEventCard.tsx             "Add New Event" placeholder card
├── SelfEventCard.tsx            Self-hosted event card
├── IICCard.tsx                  IIC event card with calendar buttons
├── IICEventDetailDialog.tsx     Read-only IIC event details dialog
├── CreateEventDialog.tsx        Create event form + API submission
└── CalendarTable.tsx            "My Calendar Activities" full table
```

---

## IIC Activities Tab

- Shows only `status: "approved"` IIC events assigned to this club.
- **Filters**: semester/quarter dropdown, free-text search.
- Each card has **View Details** and **Add to Calendar** / **Remove from Calendar**.

## Self Driven Activities Tab

Two nested tabs: **Current** (end date ≥ today) and **Past** (end date < today).

- **Current** includes an **Add New Event** card that opens `CreateEventDialog`.
- The dialog submits via `POST /api/events/create` (authenticated + club-owned).

## My Calendar Activities Tab

A full-width table (`CalendarTable.tsx`) with columns:

| Column | Description |
|---|---|
| S.No. | Row index |
| Title of Activity | Name, semester/quarter, free/paid badge |
| View Activity Details | Opens `IICEventDetailDialog` |
| Upload Activity Report | Routes to `/club/event/[id]#after-event` |
| Report Status | Badge: Not Started / Report Submitted / Media Uploaded / Completed |
| Reviewer's Comment | Text or "NA" |
| Review for Request | Text or "NA" |
| Download Report | Disabled (not yet implemented) |
| Action | Delete row from calendar |

### Report status logic (`utils.ts → getReportStatus`)

| Condition | Label |
|---|---|
| No `after_event_report` row | Not Started |
| `report_submitted = true` | Report Submitted |
| `report_submitted + media_uploaded` | Media Uploaded |
| All three flags true | Completed |

---

## Database Tables

```sql
-- club_event_calendar: links a club to IIC events they've added
CREATE TABLE public.club_event_calendar (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  club_id      UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  added_at     TIMESTAMPTZ DEFAULT NOW(),
  report_status TEXT DEFAULT 'Not Submitted',
  reviewer_comment TEXT,
  review_request   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, club_id)
);
```

See `supabase/migrations/create_club_event_calendar.sql` for the full
migration including indexes and RLS policies.

---

## Future Enhancements

- [ ] Report download button (currently disabled)
- [ ] Reviewer comment submission interface
- [ ] Notifications for status changes
- [ ] Bulk calendar operations
- [ ] iCal / CSV export

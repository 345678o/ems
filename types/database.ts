/**
 * Hand-written database types derived from:
 *   - supabase/migrations/create_club_event_calendar.sql
 *   - supabase/seed.sql (INSERT column lists)
 *   - Query shapes used across the codebase
 *
 * Run `supabase gen types typescript --local > types/database.ts` once the
 * Supabase CLI is wired up to replace this file with the generated version.
 */

// ---------------------------------------------------------------------------
// Primitive helpers
// ---------------------------------------------------------------------------

export type ISODateString = string; // e.g. "2025-09-15T09:00:00+05:30"
export type UUID = string;

// ---------------------------------------------------------------------------
// public.users
// ---------------------------------------------------------------------------

export interface DbUser {
  id: UUID;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role?: string | null; // "user" | "club" | "admin"
  password_hash?: string | null; // server-only; never select client-side
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ---------------------------------------------------------------------------
// public.clubs
// ---------------------------------------------------------------------------

export interface DbClub {
  id: UUID;
  name: string | null;
  about: string | null;
  faculty_coordinator: string | null;
  faculty_coordinator_designation: string | null;
  owner_id: UUID | null;
  avatar_url: string | null;
  email?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ---------------------------------------------------------------------------
// public.events
// ---------------------------------------------------------------------------

export type EventStatus =
  "draft" | "pending_approval" | "approved" | "rejected";
export type EventType = "free" | "paid";
export type EventHosted = "self" | "iic";

/** Banners stored as a JSON column — keys are aspect ratios / named slots. */
export type EventBanners = {
  "1x1"?: string;
  "16:9"?: string;
  "21:9"?: string;
  logo?: string;
};

export interface DbEvent {
  id: UUID;
  name: string;
  theme: string | null;
  start_datetime: ISODateString;
  end_datetime: ISODateString;
  estimated_participants: number | null;
  estimated_budget: number | string | null;
  event_blueprint: string | null;
  event_type: EventType;
  status: EventStatus;
  hosted: EventHosted;
  club_id: UUID;
  venue: string | null;
  city: string | null;
  country: string | null;
  additional_details: string | null;
  description: string | null;
  /** Semester label, e.g. "semester-1" */
  semester: string | null;
  /** Quarter label, e.g. "quarter-1" */
  quarter: string | null;
  /** Human-readable date range, e.g. "September-November" */
  date_range: string | null;
  banners: EventBanners | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Subset returned when joining clubs to an event query. */
export interface DbEventWithClub extends DbEvent {
  clubs: Pick<DbClub, "name" | "avatar_url" | "email"> | null;
}

// ---------------------------------------------------------------------------
// public.club_event_calendar
// ---------------------------------------------------------------------------

export interface DbClubEventCalendar {
  id: UUID;
  event_id: UUID;
  club_id: UUID;
  added_at: ISODateString;
  report_status: string | null;
  reviewer_comment: string | null;
  review_request: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** With the nested event join used in app/club/page.tsx */
export interface DbCalendarEntryWithEvent extends DbClubEventCalendar {
  events: DbEvent | null;
}

// ---------------------------------------------------------------------------
// public.event_tickets
// ---------------------------------------------------------------------------

export type TicketClass = "general" | "vip" | "premium";

export interface DbEventTicket {
  id: UUID;
  event_id: UUID;
  name: string;
  ticket_class: TicketClass;
  price: number;
  inclusions: string[] | null;
  available_quantity: number;
  sold_quantity: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ---------------------------------------------------------------------------
// public.event_coupons
// ---------------------------------------------------------------------------

export type DiscountType = "percentage" | "fixed";

export interface DbEventCoupon {
  id: UUID;
  event_id: UUID;
  code: string;
  discount_amount: number;
  discount_type: DiscountType;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ---------------------------------------------------------------------------
// public.event_forms
// ---------------------------------------------------------------------------

export type FormFieldType =
  "text" | "email" | "number" | "textarea" | "select" | "checkbox";

export interface DbEventForm {
  id: UUID;
  event_id: UUID;
  field_type: FormFieldType;
  field_label: string;
  field_required: boolean;
  field_options: string[] | null;
  field_order: number;
}

// ---------------------------------------------------------------------------
// public.event_participants
// ---------------------------------------------------------------------------

export interface DbEventParticipant {
  id: UUID;
  event_id: UUID;
  name: string;
  email: string;
  pass_type: "general" | "vip" | "premium" | "waitlist";
  registration_status: "pending" | "approved" | "rejected";
  registration_date: ISODateString;
}

// ---------------------------------------------------------------------------
// public.student_council
// ---------------------------------------------------------------------------

export interface DbStudentCouncilMember {
  id: UUID;
  club_id: UUID;
  role: string;
  name: string;
  email: string;
  discipline: string | null;
  semester: string | null;
  stream: string | null;
  year: number | null;
  association_with: string | null;
}

/** Shape used when upserting — id is optional for new rows */
export type DbStudentCouncilUpsert = Omit<DbStudentCouncilMember, "id"> & {
  id?: UUID;
};

// ---------------------------------------------------------------------------
// public.faculty_council
// ---------------------------------------------------------------------------

export interface DbFacultyCouncilMember {
  id: UUID;
  club_id: UUID;
  role: string;
  name: string;
  phone: string;
  email: string;
  department: string | null;
  designation: string | null;
  qualification: string | null;
  experience: number | null;
}

/** Shape used when upserting — id is optional for new rows */
export type DbFacultyCouncilUpsert = Omit<DbFacultyCouncilMember, "id"> & {
  id?: UUID;
};

// ---------------------------------------------------------------------------
// public.after_event_reports
// ---------------------------------------------------------------------------

export interface DbAfterEventReport {
  id: UUID;
  event_id: UUID | null;
  submitted_by: UUID | null;
  program_type: string;
  other_program_type: string | null;
  program_theme: string;
  duration_hours: number;
  start_date: string;
  end_date: string;
  student_participants: number;
  faculty_participants: number;
  external_participants: number | null;
  expenditure_amount: number | null;
  remark: string | null;
  session_delivery_mode: string;
  activity_lead_by: string;
  objective: string;
  benefits: string;
  event_images: string[] | null;
  video_url: string | null;
  event_report: string | null;
  permission_letter: string | null;
  event_video: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  report_submitted: boolean | null;
  media_uploaded: boolean | null;
  social_media_promoted: boolean | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ---------------------------------------------------------------------------
// NextAuth session extension
// ---------------------------------------------------------------------------

/**
 * The NextAuth session's user object is extended with `id` in
 * app/api/auth/[...nextauth]/route.ts.  Use this type instead of
 * `(session as any)?.user?.id`.
 */
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

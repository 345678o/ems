export interface ClubEvent {
  id: string;
  name: string;
  start_datetime: string;
  end_datetime: string;
  event_type: string;
  status: string;
  created_at: string;
  description?: string;
  semester?: string;
  quarter?: string;
  date_range?: string;
  hosted?: string;
}

export interface CalendarEvent {
  id: string;
  event_id: string;
  club_id: string;
  added_at: string;
  report_status?: string;
  reviewer_comment?: string;
  review_request?: string;
  event?: ClubEvent;
  after_event_report?: {
    report_submitted: boolean;
    media_uploaded: boolean;
    social_media_promoted: boolean;
  };
}

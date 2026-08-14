export interface IICEventData {
  id: string;
  title: string;
  quarter: string;
  description: string;
  semester?: string;
  dateRange?: string;
  club_id?: string;
  club_name?: string;
  has_report?: boolean;
}

export type IICClub = { id: string; name: string; avatar_url?: string };

export interface CreateIICEventForm {
  title: string;
  description: string;
  semesterQuarter: string;
  clubId: string;
}

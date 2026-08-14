export type TabType = "details" | "forms" | "coupons" | "tickets";

export interface FormField {
  id: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox";
  label: string;
  required: boolean;
  options?: string[];
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  maxUses: number;
  currentUses: number;
  active: boolean;
}

export interface Ticket {
  id: string;
  name: string;
  class: TicketClass;
  price: number;
  inclusions: string[];
  available: number;
}

export type TicketClass = "general" | "vip" | "premium";

export interface Event {
  id: string;
  name: string;
  start_datetime: string;
  end_datetime: string;
  event_type: string;
  status: string;
  venue: string;
  city: string;
  country: string;
  additional_details: string;
  created_at: string;
  updated_at: string;
  banners?: Record<string, string> | null;
}

export type BannerState = {
  banner_1x1: { path: string; url: string } | null;
  banner_16x9: { path: string; url: string } | null;
  banner_21x9: { path: string; url: string } | null;
  logo_png: { path: string; url: string } | null;
};

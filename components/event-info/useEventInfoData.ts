"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/browserClient";
import type { EventBanners } from "@/types/database";
import type { FormField, Coupon, Ticket, Event, BannerState } from "./types";

// ---------------------------------------------------------------------------
// Return shape
// ---------------------------------------------------------------------------
export interface UseEventInfoDataReturn {
  // Saving
  isSaving: boolean;
  saveEventDetails: () => Promise<void>;

  // Banners
  banners: BannerState;
  setBanners: React.Dispatch<React.SetStateAction<BannerState>>;
  buildBannersJson: (state: BannerState) => Record<string, string>;

  // Event details form
  eventDetails: EventDetailsState;
  setEventDetails: React.Dispatch<React.SetStateAction<EventDetailsState>>;

  // Form fields
  formFields: FormField[];
  newField: Partial<FormField>;
  setNewField: React.Dispatch<React.SetStateAction<Partial<FormField>>>;
  addFormField: () => Promise<void>;
  removeFormField: (id: string) => Promise<void>;

  // Coupons
  coupons: Coupon[];
  newCoupon: NewCouponState;
  setNewCoupon: React.Dispatch<React.SetStateAction<NewCouponState>>;
  addCoupon: () => Promise<void>;
  toggleCoupon: (id: string) => Promise<void>;
  removeCoupon: (id: string) => Promise<void>;

  // Tickets
  tickets: Ticket[];
  newTicket: NewTicketState;
  setNewTicket: React.Dispatch<React.SetStateAction<NewTicketState>>;
  addTicket: () => Promise<void>;
  removeTicket: (id: string) => Promise<void>;
  addInclusion: () => void;
  updateInclusion: (index: number, value: string) => void;
  removeInclusion: (index: number) => void;
}

// ---------------------------------------------------------------------------
// Local state shape types (kept here so the hook file is self-contained)
// ---------------------------------------------------------------------------
export interface EventDetailsState {
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: string;
  category: string;
  status: string;
}

export type NewCouponState = {
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  maxUses: number;
};

export type NewTicketState = {
  name: string;
  class: "general" | "vip" | "premium";
  price: number;
  inclusions: string[];
  available: number;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useEventInfoData(
  event: Event,
  onEventUpdate: () => void
): UseEventInfoDataReturn {
  // ── Banners ────────────────────────────────────────────────────────────────
  const [banners, setBanners] = useState<BannerState>({
    banner_1x1: null,
    banner_16x9: null,
    banner_21x9: null,
    logo_png: null,
  });

  const setBannersFromJson = (
    json: Record<string, string> | null | undefined
  ) => {
    if (!json) return;
    setBanners({
      banner_1x1: json["1x1"] ? { path: "", url: json["1x1"] } : null,
      banner_16x9: json["16:9"] ? { path: "", url: json["16:9"] } : null,
      banner_21x9: json["21:9"] ? { path: "", url: json["21:9"] } : null,
      logo_png: json["logo"] ? { path: "", url: json["logo"] } : null,
    });
  };

  const buildBannersJson = (state: BannerState): Record<string, string> => {
    const out: Record<string, string> = {};
    if (state.banner_1x1?.url) out["1x1"] = state.banner_1x1.url;
    if (state.banner_16x9?.url) out["16:9"] = state.banner_16x9.url;
    if (state.banner_21x9?.url) out["21:9"] = state.banner_21x9.url;
    if (state.logo_png?.url) out["logo"] = state.logo_png.url;
    return out;
  };

  // ── Event details ──────────────────────────────────────────────────────────
  const [eventDetails, setEventDetails] = useState<EventDetailsState>({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    category: "",
    status: "draft",
  });

  // Initialise from event prop
  useEffect(() => {
    if (!event) return;
    const startDate = new Date(event.start_datetime);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEventDetails({
      name: event.name || "",
      description: event.additional_details || "",
      date: startDate.toISOString().split("T")[0],
      time: startDate.toTimeString().slice(0, 5),
      location: event.venue || "",
      capacity: "100",
      category: event.event_type || "",
      status: event.status || "draft",
    });

    setBannersFromJson(
      (event.banners as EventBanners | null | undefined) ?? null
    );
  }, [event]);

  // Load banners from storage when DB banners are absent
  useEffect(() => {
    const loadBanners = async () => {
      if (!event?.id) return;
      if (Object.values(banners).some(Boolean)) return;
      const bucket = "event-assets";
      const basePath = `${event.id}/banners`;
      const keys = [
        { k: "banner_1x1" as const, file: "banner_1x1" },
        { k: "banner_16x9" as const, file: "banner_16x9" },
        { k: "banner_21x9" as const, file: "banner_21x9" },
        { k: "logo_png" as const, file: "logo_png" },
      ];
      try {
        const found: Partial<BannerState> = {};
        const { data, error } = await supabase.storage
          .from(bucket)
          .list(basePath);
        if (!error && data?.length) {
          for (const { k, file } of keys) {
            const match = data.find((d) => d.name.startsWith(file));
            if (match) {
              const path = `${basePath}/${match.name}`;
              const { data: pub } = supabase.storage
                .from(bucket)
                .getPublicUrl(path);
              found[k] = { path, url: pub.publicUrl };
            }
          }
        }
        setBanners((prev) => ({ ...prev, ...found }));
      } catch (e) {
        console.error("Error loading banners:", e);
      }
    };
    loadBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id]);

  // ── Save event details ─────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);

  const saveEventDetails = async () => {
    if (!event) return;
    setIsSaving(true);
    try {
      const startDateTime = new Date(
        `${eventDetails.date}T${eventDetails.time}:00Z`
      );
      const endDateTime = new Date(
        startDateTime.getTime() + 2 * 60 * 60 * 1000
      );
      const { error } = await supabase
        .from("events")
        .update({
          name: eventDetails.name,
          start_datetime: startDateTime.toISOString(),
          end_datetime: endDateTime.toISOString(),
          event_type: eventDetails.category,
          venue: eventDetails.location,
          city: eventDetails.location,
          country: "Online",
          additional_details: eventDetails.description,
        })
        .eq("id", event.id);
      if (error) {
        console.error("Error updating event:", error);
        alert("Error updating event. Please try again.");
        return;
      }
      alert("Event updated successfully!");
      onEventUpdate();
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error updating event. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Form fields ────────────────────────────────────────────────────────────
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [newField, setNewField] = useState<Partial<FormField>>({
    type: "text",
    label: "",
    required: false,
  });

  const loadFormFields = async () => {
    try {
      const { data, error } = await supabase
        .from("event_forms")
        .select("*")
        .eq("event_id", event.id)
        .order("field_order");
      if (error) {
        console.error("Error loading form fields:", error);
        return;
      }
      setFormFields(
        data?.map((f) => ({
          id: f.id,
          type: f.field_type,
          label: f.field_label,
          required: f.field_required,
          options: f.field_options,
        })) || []
      );
    } catch (e) {
      console.error("Error loading form fields:", e);
    }
  };

  const addFormField = async () => {
    if (!newField.label || !event) return;
    try {
      const { data, error } = await supabase
        .from("event_forms")
        .insert([
          {
            event_id: event.id,
            field_type: newField.type || "text",
            field_label: newField.label,
            field_required: newField.required || false,
            field_options: newField.options || [],
            field_order: formFields.length,
          },
        ])
        .select()
        .single();
      if (error) {
        console.error("Error adding form field:", error);
        alert("Error adding form field. Please try again.");
        return;
      }
      setFormFields([
        ...formFields,
        {
          id: data.id,
          type: data.field_type,
          label: data.field_label,
          required: data.field_required,
          options: data.field_options,
        },
      ]);
      setNewField({ type: "text", label: "", required: false });
    } catch (e) {
      console.error("Error adding form field:", e);
      alert("Error adding form field. Please try again.");
    }
  };

  const removeFormField = async (id: string) => {
    try {
      const { error } = await supabase
        .from("event_forms")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Error removing form field:", error);
        alert("Error removing form field. Please try again.");
        return;
      }
      setFormFields(formFields.filter((f) => f.id !== id));
    } catch (e) {
      console.error("Error removing form field:", e);
      alert("Error removing form field. Please try again.");
    }
  };

  // ── Coupons ────────────────────────────────────────────────────────────────
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCoupon, setNewCoupon] = useState<NewCouponState>({
    code: "",
    discount: 0,
    type: "percentage",
    maxUses: 100,
  });

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("event_coupons")
        .select("*")
        .eq("event_id", event.id);
      if (error) {
        console.error("Error loading coupons:", error);
        return;
      }
      setCoupons(
        data?.map((c) => ({
          id: c.id,
          code: c.code,
          discount: c.discount_amount,
          type: c.discount_type,
          maxUses: c.max_uses,
          currentUses: c.current_uses,
          active: c.is_active,
        })) || []
      );
    } catch (e) {
      console.error("Error loading coupons:", e);
    }
  };

  const addCoupon = async () => {
    if (!newCoupon.code || !event) return;
    try {
      const { data, error } = await supabase
        .from("event_coupons")
        .insert([
          {
            event_id: event.id,
            code: newCoupon.code.toUpperCase(),
            discount_amount: newCoupon.discount,
            discount_type: newCoupon.type,
            max_uses: newCoupon.maxUses,
            current_uses: 0,
            is_active: true,
          },
        ])
        .select()
        .single();
      if (error) {
        console.error("Error adding coupon:", error);
        alert("Error adding coupon. Please try again.");
        return;
      }
      setCoupons([
        ...coupons,
        {
          id: data.id,
          code: data.code,
          discount: data.discount_amount,
          type: data.discount_type,
          maxUses: data.max_uses,
          currentUses: data.current_uses,
          active: data.is_active,
        },
      ]);
      setNewCoupon({ code: "", discount: 0, type: "percentage", maxUses: 100 });
    } catch (e) {
      console.error("Error adding coupon:", e);
      alert("Error adding coupon. Please try again.");
    }
  };

  const toggleCoupon = async (id: string) => {
    try {
      const coupon = coupons.find((c) => c.id === id);
      if (!coupon) return;
      const { error } = await supabase
        .from("event_coupons")
        .update({ is_active: !coupon.active })
        .eq("id", id);
      if (error) {
        console.error("Error toggling coupon:", error);
        alert("Error updating coupon. Please try again.");
        return;
      }
      setCoupons(
        coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
      );
    } catch (e) {
      console.error("Error toggling coupon:", e);
      alert("Error updating coupon. Please try again.");
    }
  };

  const removeCoupon = async (id: string) => {
    try {
      const { error } = await supabase
        .from("event_coupons")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Error removing coupon:", error);
        alert("Error removing coupon. Please try again.");
        return;
      }
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (e) {
      console.error("Error removing coupon:", e);
      alert("Error removing coupon. Please try again.");
    }
  };

  // ── Tickets ────────────────────────────────────────────────────────────────
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [newTicket, setNewTicket] = useState<NewTicketState>({
    name: "",
    class: "general",
    price: 0,
    inclusions: [""],
    available: 100,
  });

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("event_tickets")
        .select("*")
        .eq("event_id", event.id);
      if (error) {
        console.error("Error loading tickets:", error);
        return;
      }
      setTickets(
        data?.map((t) => ({
          id: t.id,
          name: t.name,
          class: t.ticket_class,
          price: t.price,
          inclusions: t.inclusions || [],
          available: t.available_quantity,
        })) || []
      );
    } catch (e) {
      console.error("Error loading tickets:", e);
    }
  };

  const addTicket = async () => {
    if (!newTicket.name || !event) return;
    try {
      const { data, error } = await supabase
        .from("event_tickets")
        .insert([
          {
            event_id: event.id,
            name: newTicket.name,
            ticket_class: newTicket.class,
            price: newTicket.price,
            inclusions: newTicket.inclusions.filter((i) => i.trim() !== ""),
            available_quantity: newTicket.available,
            sold_quantity: 0,
          },
        ])
        .select()
        .single();
      if (error) {
        console.error("Error adding ticket:", error);
        alert("Error adding ticket. Please try again.");
        return;
      }
      setTickets([
        ...tickets,
        {
          id: data.id,
          name: data.name,
          class: data.ticket_class,
          price: data.price,
          inclusions: data.inclusions || [],
          available: data.available_quantity,
        },
      ]);
      setNewTicket({
        name: "",
        class: "general",
        price: 0,
        inclusions: [""],
        available: 100,
      });
    } catch (e) {
      console.error("Error adding ticket:", e);
      alert("Error adding ticket. Please try again.");
    }
  };

  const removeTicket = async (id: string) => {
    try {
      const { error } = await supabase
        .from("event_tickets")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Error removing ticket:", error);
        alert("Error removing ticket. Please try again.");
        return;
      }
      setTickets(tickets.filter((t) => t.id !== id));
    } catch (e) {
      console.error("Error removing ticket:", e);
      alert("Error removing ticket. Please try again.");
    }
  };

  const addInclusion = () =>
    setNewTicket({ ...newTicket, inclusions: [...newTicket.inclusions, ""] });

  const updateInclusion = (index: number, value: string) => {
    const updated = [...newTicket.inclusions];
    updated[index] = value;
    setNewTicket({ ...newTicket, inclusions: updated });
  };

  const removeInclusion = (index: number) =>
    setNewTicket({
      ...newTicket,
      inclusions: newTicket.inclusions.filter((_, i) => i !== index),
    });

  // ── Load all data on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!event) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFormFields();

    loadCoupons();

    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  // ── Return ─────────────────────────────────────────────────────────────────
  return {
    isSaving,
    saveEventDetails,
    banners,
    setBanners,
    buildBannersJson,
    eventDetails,
    setEventDetails,
    formFields,
    newField,
    setNewField,
    addFormField,
    removeFormField,
    coupons,
    newCoupon,
    setNewCoupon,
    addCoupon,
    toggleCoupon,
    removeCoupon,
    tickets,
    newTicket,
    setNewTicket,
    addTicket,
    removeTicket,
    addInclusion,
    updateInclusion,
    removeInclusion,
  };
}

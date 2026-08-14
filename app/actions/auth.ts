"use server";

import { createClient } from "@/lib/supabase/server";

type UserProfile = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

export async function createOrUpdateUser(profile: UserProfile) {
  // NOTE: do not log the profile object — it contains PII (email, name, avatar).
  try {
    const supabase = await createClient();

    // Select only the columns we actually need to decide insert vs. update.
    // Avoid SELECT * to prevent accidentally reading future sensitive columns
    // (e.g. password_hash) into server memory unnecessarily.
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("id", profile.id)
      .maybeSingle();

    if (fetchError) {
      console.error(
        "[Supabase] createOrUpdateUser: fetch error",
        fetchError.message
      );
    }

    const userData = {
      id: profile.id,
      email: profile.email,
      full_name: profile.name,
      avatar_url: profile.image,
      updated_at: new Date().toISOString(),
    };

    if (!existingUser) {
      const { error: insertError } = await supabase
        .from("users")
        .insert([{ ...userData, created_at: new Date().toISOString() }]);
      if (insertError) {
        console.error(
          "[Supabase] createOrUpdateUser: insert error",
          insertError.message
        );
      }
    } else {
      const { error: updateError } = await supabase
        .from("users")
        .update(userData)
        .eq("id", profile.id);
      if (updateError) {
        console.error(
          "[Supabase] createOrUpdateUser: update error",
          updateError.message
        );
      }
    }
  } catch (_) {
    console.error("[Supabase] createOrUpdateUser: unexpected exception");
  }

  return { success: true };
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { supabase } from "@/lib/supabase/browserClient";

export default function FacultyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.email) {
      router.push("/");
      return;
    }

    const checkRole = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("role,full_name")
        .eq("email", session.user?.email)
        .single();

      if (error) {
        console.error("Error fetching role:", error);
        router.replace("/");
        return;
      }

      if (data?.role === "user") {
        router.replace("/user/profile");
      } else if (data?.role === "club") {
        router.replace("/club");
      } else if (data?.role === "admin") {
        router.replace("/admin");
      } else if (data?.role !== "faculty") {
        router.replace("/home");
      } else {
        setName(data.full_name ?? null);
        setLoading(false);
      }
    };

    checkRole();
  }, [session?.user?.email, status, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141414]">
        <p className="text-neutral-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-2 px-6 py-16">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#FF8AC9]">
          Faculty Portal
        </span>
        <h1 className="text-3xl font-semibold">
          Welcome{name ? `, ${name}` : ""}
        </h1>
        <p className="mt-1 text-neutral-400">
          Signed in as {session?.user?.email}.
        </p>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/home" })}
          className="mt-8 rounded-full bg-white/5 px-5 py-2 text-sm text-neutral-200 transition-colors hover:bg-white/10"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

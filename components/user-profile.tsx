// components/UserProfile.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

type ProfileState = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  avatar_url?: string | null;
};

export function UserProfile() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileState>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    avatar_url: null,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) {
          console.error("[UserProfile] GET /api/me failed", await res.json());
          return;
        }
        const { user } = await res.json();
        if (mounted && user) {
          setProfileData({
            first_name: user.first_name ?? "",
            last_name: user.last_name ?? "",
            email: user.email ?? "",
            phone_number: user.phone_number ?? "",
            avatar_url: user.avatar_url ?? null,
          });
        }
      } catch (e) {
        console.error("[UserProfile] load error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleInputChange = (field: keyof ProfileState, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone_number: profileData.phone_number,
        }),
      });
      if (!res.ok) {
        console.error("[UserProfile] PATCH /api/me failed", await res.json());
        alert("Update failed");
        return;
      }
      alert("Profile updated");
    } catch (e) {
      console.error("[UserProfile] update error:", e);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleImageEdit = () => {
    // TODO: implement upload → save avatar_url via PATCH /api/me
  };

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="mb-6">
        <h1 className="text-white text-lg font-medium mb-4">
          Club - Event Dashboard - User Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
        {/* Left Side - Username Section */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-white text-2xl font-semibold mb-2">
                {profileData.first_name || profileData.last_name
                  ? `${profileData.first_name} ${profileData.last_name}`.trim()
                  : "Username"}
              </h2>
              <p className="text-neutral-400 text-lg">Student</p>
            </div>

            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={profileData.avatar_url || "/professional-profile.png"}
                  alt="Profile"
                />
                <AvatarFallback className="bg-neutral-700 text-white text-2xl">
                  {(
                    profileData.first_name?.[0] ||
                    session?.user?.name?.[0] ||
                    "U"
                  ).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <Button
              variant="ghost"
              onClick={handleImageEdit}
              className="text-blue-400 hover:text-blue-300 hover:bg-neutral-800 flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Edit Image
            </Button>
          </CardContent>
        </Card>

        {/* Right Side - Profile Details */}
        <Card className="bg-neutral-900 border-neutral-700">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-2xl font-semibold mb-6">
                Profile Details
              </h2>
              {loading && (
                <span className="text-xs text-neutral-400">Loading…</span>
              )}
            </div>

            <div className="space-y-6">
              {/* Firstname */}
              <div>
                <Label htmlFor="firstname" className="text-white mb-2 block">
                  Firstname
                </Label>
                <div className="relative">
                  <div
                    className="rounded-lg p-[2px]"
                    style={{
                      background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                    }}
                  >
                    <input
                      id="firstname"
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) =>
                        handleInputChange("first_name", e.target.value)
                      }
                      className="w-full bg-neutral-800 text-white px-3 py-2 rounded-md outline-none placeholder:text-neutral-400"
                      placeholder="Enter firstname"
                    />
                  </div>
                </div>
              </div>

              {/* Lastname */}
              <div>
                <Label htmlFor="lastname" className="text-white mb-2 block">
                  Lastname
                </Label>
                <div className="relative">
                  <div
                    className="rounded-lg p-[2px]"
                    style={{
                      background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                    }}
                  >
                    <input
                      id="lastname"
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) =>
                        handleInputChange("last_name", e.target.value)
                      }
                      className="w-full bg-neutral-800 text-white px-3 py-2 rounded-md outline-none placeholder:text-neutral-400"
                      placeholder="Enter lastname"
                    />
                  </div>
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <Label htmlFor="email" className="text-white mb-2 block">
                  Email
                </Label>
                <Input
                  id="email"
                  value={profileData.email}
                  readOnly
                  className="bg-neutral-800 text-white"
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-white mb-2 block">
                  Phone no.
                </Label>
                <div className="relative">
                  <div
                    className="rounded-lg p-[2px]"
                    style={{
                      background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                    }}
                  >
                    <input
                      id="phone"
                      type="tel"
                      value={profileData.phone_number}
                      onChange={(e) =>
                        handleInputChange("phone_number", e.target.value)
                      }
                      className="w-full bg-neutral-800 text-white px-3 py-2 rounded-md outline-none placeholder:text-neutral-400"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleUpdate}
                  disabled={saving || loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2 rounded-lg font-medium"
                >
                  {saving ? "Saving…" : "Update"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

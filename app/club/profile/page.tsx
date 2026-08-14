"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase/browserClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ImageIcon, Pencil, Trash2, Plus } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Autoplay from "embla-carousel-autoplay";

interface EventData {
  id: string;
  hosted: string;
  banners?: {
    "1x1": string;
    "16:9": string;
    "21:9": string;
  };
}

interface ClubData {
  about?: string;
  faculty_coordinator?: string;
  faculty_coordinator_designation?: string;
  name?: string | null;
  avatar_url?: string | null;
}

interface StudentCouncilMember {
  id: string;
  club_id: string;
  role: string;
  name: string;
  email: string;
  discipline?: string;
  semester?: string;
  stream?: string;
  year?: number;
  association_with?: string;
}

interface FacultyCouncilMember {
  id: string;
  club_id: string;
  role: string;
  name: string;
  phone: string;
  email: string;
  department?: string;
  designation?: string;
  qualification?: string;
  experience?: number;
}

interface ProfileStats {
  selfDrivenCount: number;
  iicEventsCount: number;
  banners: string[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<ClubData | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    selfDrivenCount: 0,
    iicEventsCount: 0,
    banners: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    about: "",
    faculty_coordinator: "",
    faculty_coordinator_designation: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Student Council state
  const [studentCouncil, setStudentCouncil] = useState<StudentCouncilMember[]>(
    []
  );
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] =
    useState<StudentCouncilMember | null>(null);
  const [studentForm, setStudentForm] = useState({
    role: "",
    name: "",
    email: "",
    discipline: "",
    semester: "",
    stream: "",
    year: "",
    association_with: "",
  });

  // Faculty Council state
  const [facultyCouncil, setFacultyCouncil] = useState<FacultyCouncilMember[]>(
    []
  );
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] =
    useState<FacultyCouncilMember | null>(null);
  const [facultyForm, setFacultyForm] = useState({
    role: "",
    name: "",
    phone: "",
    email: "",
    department: "",
    designation: "",
    qualification: "",
    experience: "",
  });

  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  const sessionUserId = session?.user?.id ?? null;

  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch club profile from public.clubs where id = sessionUserId
      const [
        { data: club, error: clubError },
        { data: events, error: eventsError },
      ] = await Promise.all([
        supabase
          .from("clubs")
          .select(
            "about, faculty_coordinator, faculty_coordinator_designation, name, avatar_url"
          )
          .eq("id", sessionUserId)
          .maybeSingle(),
        // Fetch all events for this club for stats and banners
        supabase
          .from("events")
          .select("id, hosted, banners")
          .eq("club_id", sessionUserId),
      ]);

      if (clubError) {
        console.error("Error fetching club profile:", clubError);
      } else if (club) {
        setProfileData(club as ClubData);
      }

      if (eventsError) {
        console.error("Error fetching events for stats:", eventsError);
      }

      if (events && events.length > 0) {
        // Calculate stats
        const selfDrivenEvents = (events as EventData[]).filter(
          (e) => e.hosted === "self"
        );
        const iicEvents = (events as EventData[]).filter(
          (e) => e.hosted === "iic"
        );

        // Extract 16:9 banners from self-driven events
        const bannerUrls: string[] = [];
        selfDrivenEvents.forEach((event) => {
          if (event.banners && event.banners["16:9"]) {
            bannerUrls.push(event.banners["16:9"]);
          }
        });

        setStats({
          selfDrivenCount: selfDrivenEvents.length,
          iicEventsCount: iicEvents.length,
          banners: bannerUrls,
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionUserId]);

  const openEditModal = () => {
    setEditForm({
      name: profileData?.name || session?.user?.name || "",
      about: profileData?.about || "",
      faculty_coordinator: profileData?.faculty_coordinator || "",
      faculty_coordinator_designation:
        profileData?.faculty_coordinator_designation || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      setUpdateError(null);

      const { error } = await supabase.from("clubs").upsert({
        id: sessionUserId,
        name: editForm.name,
        about: editForm.about,
        faculty_coordinator: editForm.faculty_coordinator,
        faculty_coordinator_designation:
          editForm.faculty_coordinator_designation,
        owner_id: sessionUserId,
      });

      if (error) {
        setUpdateError(error.message);
        return;
      }

      // Update local state
      setProfileData({
        ...profileData,
        name: editForm.name,
        about: editForm.about,
        faculty_coordinator: editForm.faculty_coordinator,
        faculty_coordinator_designation:
          editForm.faculty_coordinator_designation,
      });

      setIsEditModalOpen(false);
    } catch (error: unknown) {
      setUpdateError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Student Council functions
  const fetchStudentCouncil = useCallback(async () => {
    const { data, error } = await supabase
      .from("student_council")
      .select("*")
      .eq("club_id", sessionUserId);

    if (error) {
      console.error("Error fetching student council:", error);
    } else {
      setStudentCouncil(data || []);
    }
  }, [sessionUserId]);

  const openStudentModal = (member?: StudentCouncilMember) => {
    if (member) {
      setEditingStudent(member);
      setStudentForm({
        role: member.role,
        name: member.name,
        email: member.email,
        discipline: member.discipline || "",
        semester: member.semester || "",
        stream: member.stream || "",
        year: member.year?.toString() || "",
        association_with: member.association_with || "",
      });
    } else {
      setEditingStudent(null);
      setStudentForm({
        role: "",
        name: "",
        email: "",
        discipline: "",
        semester: "",
        stream: "",
        year: "",
        association_with: "",
      });
    }
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async () => {
    try {
      setIsUpdating(true);
      const studentData: Omit<StudentCouncilMember, "id"> & { id?: string } = {
        club_id: sessionUserId!,
        role: studentForm.role,
        name: studentForm.name,
        email: studentForm.email,
        discipline: studentForm.discipline || undefined,
        semester: studentForm.semester || undefined,
        stream: studentForm.stream || undefined,
        year: studentForm.year ? parseInt(studentForm.year) : undefined,
        association_with: studentForm.association_with || undefined,
      };

      if (editingStudent) {
        studentData.id = editingStudent.id;
      }

      const { error } = await supabase
        .from("student_council")
        .upsert(studentData);

      if (error) throw error;

      await fetchStudentCouncil();
      setIsStudentModalOpen(false);
    } catch (error: unknown) {
      console.error(
        "Error saving student:",
        error instanceof Error ? error.message : error
      );
      setUpdateError(
        error instanceof Error ? error.message : "Failed to save member"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      const { error } = await supabase
        .from("student_council")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchStudentCouncil();
    } catch (error: unknown) {
      console.error(
        "Error deleting student:",
        error instanceof Error ? error.message : error
      );
      alert("Failed to delete member");
    }
  };

  // Faculty Council functions
  const fetchFacultyCouncil = useCallback(async () => {
    const { data, error } = await supabase
      .from("faculty_council")
      .select("*")
      .eq("club_id", sessionUserId);

    if (error) {
      console.error("Error fetching faculty council:", error);
    } else {
      setFacultyCouncil(data || []);
    }
  }, [sessionUserId]);

  useEffect(() => {
    if (!sessionUserId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfileData();

    fetchStudentCouncil();

    fetchFacultyCouncil();
  }, [
    sessionUserId,
    fetchProfileData,
    fetchStudentCouncil,
    fetchFacultyCouncil,
  ]);

  const openFacultyModal = (member?: FacultyCouncilMember) => {
    if (member) {
      setEditingFaculty(member);
      setFacultyForm({
        role: member.role,
        name: member.name,
        phone: member.phone,
        email: member.email,
        department: member.department || "",
        designation: member.designation || "",
        qualification: member.qualification || "",
        experience: member.experience?.toString() || "",
      });
    } else {
      setEditingFaculty(null);
      setFacultyForm({
        role: "",
        name: "",
        phone: "",
        email: "",
        department: "",
        designation: "",
        qualification: "",
        experience: "",
      });
    }
    setIsFacultyModalOpen(true);
  };

  const handleSaveFaculty = async () => {
    try {
      setIsUpdating(true);
      const facultyData: Omit<FacultyCouncilMember, "id"> & { id?: string } = {
        club_id: sessionUserId!,
        role: facultyForm.role,
        name: facultyForm.name,
        phone: facultyForm.phone,
        email: facultyForm.email,
        department: facultyForm.department || undefined,
        designation: facultyForm.designation || undefined,
        qualification: facultyForm.qualification || undefined,
        experience: facultyForm.experience
          ? parseInt(facultyForm.experience)
          : undefined,
      };

      if (editingFaculty) {
        facultyData.id = editingFaculty.id;
      }

      const { error } = await supabase
        .from("faculty_council")
        .upsert(facultyData);

      if (error) throw error;

      await fetchFacultyCouncil();
      setIsFacultyModalOpen(false);
    } catch (error: unknown) {
      console.error(
        "Error saving faculty:",
        error instanceof Error ? error.message : error
      );
      setUpdateError(
        error instanceof Error ? error.message : "Failed to save member"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      const { error } = await supabase
        .from("faculty_council")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchFacultyCouncil();
    } catch (error: unknown) {
      console.error(
        "Error deleting faculty:",
        error instanceof Error ? error.message : error
      );
      alert("Failed to delete member");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white dark:bg-neutral-900 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 min-h-screen">
      <div className="mb-6"></div>

      <Tabs defaultValue="overview" className="w-full mb-6 bg-transparent p-0">
        <TabsList className="grid w-full grid-cols-3 mb-12 bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="bg-transparent shadow-none rounded-none border-b-2 border-transparent px-0 py-6 text-neutral-600 hover:text-neutral-800 data-[state=active]:border-b-blue-600 dark:data-[state=active]:border-b-blue-600 data-[state=active]:text-black dark:text-neutral-300 dark:hover:text-neutral-100 dark:data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="student-council"
            className="bg-transparent shadow-none rounded-none border-b-2 border-transparent px-0 py-6 text-neutral-600 hover:text-neutral-800 data-[state=active]:border-b-blue-600 dark:data-[state=active]:border-b-blue-600 data-[state=active]:text-black dark:text-neutral-300 dark:hover:text-neutral-100 dark:data-[state=active]:text-white"
          >
            Student Council
          </TabsTrigger>
          <TabsTrigger
            value="faculty-council"
            className="bg-transparent shadow-none rounded-none border-b-2 border-transparent px-0 py-6 text-neutral-600 hover:text-neutral-800 data-[state=active]:border-b-blue-600 dark:data-[state=active]:border-b-blue-600 data-[state=active]:text-black dark:text-neutral-300 dark:hover:text-neutral-100 dark:data-[state=active]:text-white"
          >
            Faculty Council
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-4 grid-rows-4 gap-4 h-full min-h-[700px]">
            {/* Avatar Card (spans 2 columns, 1 row) */}
            <Card className="border-neutral-700 col-span-2 row-span-1">
              <CardContent className="flex items-center justify-between p-4 h-full">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={session?.user?.image ?? ""}
                      alt={session?.user?.name ?? "User"}
                    />
                    <AvatarFallback className="bg-neutral-700 text-white">
                      {(session?.user?.name?.[0] ?? "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-semibold">
                        {profileData?.name ||
                          session?.user?.name ||
                          "Club Name"}
                      </h2>
                      <button
                        onClick={openEditModal}
                        className="text-neutral-400 hover:text-white transition-colors"
                        title="Edit profile"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-neutral-400 text-sm">
                      {session?.user?.email ?? ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards (spans 1 column, 2 rows) */}
            <div className="col-span-1 row-span-2 flex flex-col gap-2">
              <Card className="border-neutral-700 flex-1 bg-gradient-to-tl dark:from-purple-600 dark:via-neutral-900 dark:to-black from-pink-500 via-white to-white">
                <CardContent className="p-3 h-full flex flex-col justify-between">
                  <div className="flex items-start gap-2 mb-2 text-left">
                    <p className="text-lg font-semibold -mt-4">
                      Self Driven Events
                    </p>
                  </div>
                  <p className="text-6xl font-bold self-end text-right mr-2">
                    {stats.selfDrivenCount}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-neutral-700 bg-gradient-to-tl from-[#3A3CBA] via-[#FF1D1D] to-[#FCB045] flex-1">
                <CardContent className="p-3 h-full flex flex-col justify-between">
                  <div className="flex items-start gap-2 mb-2 text-left">
                    <p className="text-lg font-semibold -mt-4">IIC Events</p>
                  </div>
                  <p className="text-6xl font-bold self-end text-right mr-2">
                    {stats.iicEventsCount}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-neutral-700 flex-1">
                <CardContent className="p-3 h-full flex flex-col justify-between">
                  <div className="flex items-start gap-2 mb-2 text-left">
                    <p className="text-lg font-semibold -mt-4">Banner Count</p>
                  </div>
                  <p className="text-6xl font-bold self-end text-right mr-2">
                    {stats.banners.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Notifications Card (spans 1 column, 2 rows) */}
            <Card className="border-neutral-700 col-span-1 row-span-2">
              <CardHeader>
                <CardTitle className="text-2xl">Notifications</CardTitle>
              </CardHeader>
              <CardContent className="text-neutral-400">
                No new notifications
              </CardContent>
            </Card>

            {/* About Card (spans 2 columns, 2 rows) */}
            <Card className="border-neutral-700 col-span-2 row-span-2">
              <CardHeader>
                <CardTitle className="text-2xl">About</CardTitle>
              </CardHeader>
              <CardContent>
                {profileData?.about ? (
                  <p className="dark:text-neutral-300 text-neutral-600 text-lg leading-relaxed">
                    {profileData.about}
                  </p>
                ) : (
                  <p className="text-neutral-400 text-sm">
                    No description available. Add an about section to your
                    events to see it here.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Gallery Card (spans 2 columns, 2 rows) */}
            <Card className="border-neutral-700 col-span-2 row-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Event Gallery
                </CardTitle>
              </CardHeader>
              <CardContent className="relative overflow-hidden">
                {stats.banners.length > 0 ? (
                  <Carousel
                    opts={{ align: "center", loop: true }}

                    plugins={[plugin.current]}
                  >
                    <CarouselContent>
                      {stats.banners.map((bannerUrl, index) => (
                        <CarouselItem key={index}>
                          <div className="relative aspect-video bg-neutral-800 rounded-lg overflow-hidden">
                            <Image
                              src={bannerUrl}
                              alt={`Event banner ${index + 1}`}
                              fill
                              className="object-contain hover:scale-105 transition-transform duration-200"
                              sizes="(min-width: 768px) 50vw, 100vw"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ImageIcon className="h-12 w-12 text-neutral-600 mb-4" />
                    <p className="text-neutral-400 text-sm">
                      No event banners available yet.
                    </p>
                    <p className="text-neutral-500 text-xs mt-2">
                      Event banners will appear here once you create self-driven
                      events.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Faculty Coordinator Card (spans 2 columns, 1 row) */}
            <Card className="border-neutral-700 col-span-2 row-span-1">
              <CardHeader>
                <CardTitle className="text-2xl">Faculty Coordinator</CardTitle>
              </CardHeader>
              <CardContent>
                {profileData?.faculty_coordinator ? (
                  <div>
                    <p className="font-semibold text-4xl">
                      {profileData.faculty_coordinator}
                    </p>
                    {profileData.faculty_coordinator_designation && (
                      <p className="text-neutral-400 text-lg">
                        {profileData.faculty_coordinator_designation}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-neutral-400 text-sm">
                    No faculty coordinator information available.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Student Council Tab */}
        <TabsContent value="student-council">
          <Card className="border-neutral-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">
                Student Council Members
              </CardTitle>
              <GradientButton onClick={() => openStudentModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </GradientButton>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Discipline</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Association</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentCouncil.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center text-neutral-400"
                      >
                        No student council members added yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    studentCouncil.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.role}
                        </TableCell>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.discipline || "-"}</TableCell>
                        <TableCell>{member.semester || "-"}</TableCell>
                        <TableCell>{member.stream || "-"}</TableCell>
                        <TableCell>{member.year || "-"}</TableCell>
                        <TableCell>{member.association_with || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openStudentModal(member)}
                              className="border-neutral-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteStudent(member.id)}
                              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Faculty Council Tab */}
        <TabsContent value="faculty-council">
          <Card className="border-neutral-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">
                Faculty Council Members
              </CardTitle>
              <GradientButton onClick={() => openFacultyModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </GradientButton>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Experience (years)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facultyCouncil.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center text-neutral-400"
                      >
                        No faculty council members added yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    facultyCouncil.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.role}
                        </TableCell>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.department || "-"}</TableCell>
                        <TableCell>{member.designation || "-"}</TableCell>
                        <TableCell>{member.qualification || "-"}</TableCell>
                        <TableCell>{member.experience || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openFacultyModal(member)}
                              className="border-neutral-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteFaculty(member.id)}
                              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-neutral-700">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Club Name
              </Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="border-neutral-600"
                placeholder="Enter club name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="about" className="text-sm">
                About
              </Label>
              <Textarea
                id="about"
                value={editForm.about}
                onChange={(e) =>
                  setEditForm({ ...editForm, about: e.target.value })
                }
                className="border-neutral-600 min-h-[100px]"
                placeholder="Tell us about your club..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty_coordinator" className="text-sm">
                Faculty Coordinator
              </Label>
              <Input
                id="faculty_coordinator"
                value={editForm.faculty_coordinator}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    faculty_coordinator: e.target.value,
                  })
                }
                className="border-neutral-600"
                placeholder="Faculty coordinator name"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="faculty_coordinator_designation"
                className="text-sm"
              >
                Faculty Designation
              </Label>
              <Input
                id="faculty_coordinator_designation"
                value={editForm.faculty_coordinator_designation}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    faculty_coordinator_designation: e.target.value,
                  })
                }
                className="border-neutral-600"
                placeholder="Faculty coordinator designation"
              />
            </div>

            {updateError && (
              <p className="text-sm text-red-400">{updateError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="bg-transparent border-neutral-600 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Council Modal */}
      <Dialog open={isStudentModalOpen} onOpenChange={setIsStudentModalOpen}>
        <DialogContent className="sm:max-w-[600px] border-neutral-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student Member" : "Add Student Member"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-role" className="text-sm">
                  Role *
                </Label>
                <Input
                  id="student-role"
                  value={studentForm.role}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, role: e.target.value })
                  }
                  className="border-neutral-600"
                  placeholder="e.g., President, Vice President"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-name" className="text-sm">
                  Name *
                </Label>
                <Input
                  id="student-name"
                  value={studentForm.name}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, name: e.target.value })
                  }
                  className="border-neutral-600"
                  placeholder="Full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-email" className="text-sm">
                Email *
              </Label>
              <Input
                id="student-email"
                type="email"
                value={studentForm.email}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, email: e.target.value })
                }
                className="border-neutral-600"
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-discipline" className="text-sm">
                  Discipline
                </Label>
                <Input
                  id="student-discipline"
                  value={studentForm.discipline}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      discipline: e.target.value,
                    })
                  }
                  className="border-neutral-600"
                  placeholder="e.g., Engineering"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-semester" className="text-sm">
                  Semester
                </Label>
                <Input
                  id="student-semester"
                  value={studentForm.semester}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, semester: e.target.value })
                  }
                  className="border-neutral-600"
                  placeholder="e.g., 5th"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-stream" className="text-sm">
                  Stream
                </Label>
                <Input
                  id="student-stream"
                  value={studentForm.stream}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, stream: e.target.value })
                  }
                  className="border-neutral-600"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-year" className="text-sm">
                  Year
                </Label>
                <Input
                  id="student-year"
                  type="number"
                  value={studentForm.year}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, year: e.target.value })
                  }
                  className="border-neutral-600"
                  placeholder="e.g., 2024"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-association" className="text-sm">
                Association With
              </Label>
              <Input
                id="student-association"
                value={studentForm.association_with}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    association_with: e.target.value,
                  })
                }
                className="border-neutral-600"
                placeholder="Additional association information"
              />
            </div>

            {updateError && (
              <p className="text-sm text-red-400">{updateError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStudentModalOpen(false)}
              className="bg-transparent border-neutral-600 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveStudent}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Faculty Council Modal */}
      <Dialog open={isFacultyModalOpen} onOpenChange={setIsFacultyModalOpen}>
        <DialogContent className="sm:max-w-[600px] border-neutral-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFaculty ? "Edit Faculty Member" : "Add Faculty Member"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faculty-role" className="text-sm">
                  Role *
                </Label>
                <Input
                  id="faculty-role"
                  value={facultyForm.role}
                  onChange={(e) =>
                    setFacultyForm({ ...facultyForm, role: e.target.value })
                  }
                  className="border-neutral-600"
                  placeholder="e.g., Chairperson, Member"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty-name" className="text-sm">
                  Name *
                </Label>
                <Input
                  id="faculty-name"
                  value={facultyForm.name}
                  onChange={(e) =>
                    setFacultyForm({ ...facultyForm, name: e.target.value })
                  }
                  className="border-neutral-600"
                  placeholder="Full name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faculty-phone" className="text-sm">
                  Phone *
                </Label>
                <Input
                  id="faculty-phone"
                  value={facultyForm.phone}
                  onChange={(e) =>
                    setFacultyForm({ ...facultyForm, phone: e.target.value })
                  }
                  className="border-neutral-600"
                  placeholder="Contact number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty-email" className="text-sm">
                  Email *
                </Label>
                <Input
                  id="faculty-email"
                  type="email"
                  value={facultyForm.email}
                  onChange={(e) =>
                    setFacultyForm({ ...facultyForm, email: e.target.value })
                  }
                  className="border-neutral-600"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faculty-department" className="text-sm">
                  Department
                </Label>
                <Input
                  id="faculty-department"
                  value={facultyForm.department}
                  onChange={(e) =>
                    setFacultyForm({
                      ...facultyForm,
                      department: e.target.value,
                    })
                  }
                  className="border-neutral-600"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty-designation" className="text-sm">
                  Designation
                </Label>
                <Input
                  id="faculty-designation"
                  value={facultyForm.designation}
                  onChange={(e) =>
                    setFacultyForm({
                      ...facultyForm,
                      designation: e.target.value,
                    })
                  }
                  className="border-neutral-600"
                  placeholder="e.g., Professor, Associate Professor"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faculty-qualification" className="text-sm">
                  Qualification
                </Label>
                <Input
                  id="faculty-qualification"
                  value={facultyForm.qualification}
                  onChange={(e) =>
                    setFacultyForm({
                      ...facultyForm,
                      qualification: e.target.value,
                    })
                  }
                  className="border-neutral-600"
                  placeholder="e.g., Ph.D., M.Tech"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty-experience" className="text-sm">
                  Experience (years)
                </Label>
                <Input
                  id="faculty-experience"
                  type="number"
                  value={facultyForm.experience}
                  onChange={(e) =>
                    setFacultyForm({
                      ...facultyForm,
                      experience: e.target.value,
                    })
                  }
                  className="border-neutral-600"
                  placeholder="Years of experience"
                />
              </div>
            </div>

            {updateError && (
              <p className="text-sm text-red-400">{updateError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFacultyModalOpen(false)}
              className="bg-transparent border-neutral-600 text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveFaculty}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

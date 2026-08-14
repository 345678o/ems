// Seed script - run with: node supabase/seed.js
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load env
const envPath = path.join(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...val] = line.split("=");
  if (key && val.length) env[key.trim()] = val.join("=").trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or anon key in .env");
  process.exit(1);
}

console.log("Connecting to Supabase:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─── Demo IDs ────────────────────────────────────────────────────────────────
// Must match lib/utils/id.ts googleSubToUuid(email) exactly, since that's what
// the credentials login flow uses as the user's real id (clubs.id === session.user.id).
const { v5: uuidv5 } = require("uuid");
const ID_NAMESPACE = "1e1eb861-ee4f-4c5e-bed1-04ee744e8559";
const DEMO_USER_ID = uuidv5("demo@example.com", ID_NAMESPACE);
const DEMO_USER2_ID = uuidv5("techclub@mlrit.ac.in", ID_NAMESPACE);
const EVENT_IDS = [
  "e1000000-0000-4000-a000-000000000001",
  "e1000000-0000-4000-a000-000000000002",
  "e1000000-0000-4000-a000-000000000003",
  "e1000000-0000-4000-a000-000000000004",
  "e1000000-0000-4000-a000-000000000005",
];

async function seed() {
  console.log("\n🌱 Seeding EMS demo data...\n");

  // 1. Users
  console.log("1. Inserting users...");
  const { error: usersErr } = await supabase.from("users").upsert([
    {
      id: DEMO_USER_ID,
      email: "demo@example.com",
      full_name: "Demo Innovation Club",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: DEMO_USER2_ID,
      email: "techclub@mlrit.ac.in",
      full_name: "Tech Innovators Club",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  if (usersErr) console.warn("  ⚠ users:", usersErr.message);
  else console.log("  ✓ users inserted");

  // 2. Clubs
  console.log("2. Inserting clubs...");
  const { error: clubsErr } = await supabase.from("clubs").upsert([
    {
      id: DEMO_USER_ID,
      name: "Demo Innovation Club",
      about:
        "A demo club dedicated to fostering innovation, creativity, and technical excellence among students at MLRIT.",
      faculty_coordinator: "Dr. Ramesh Kumar",
      faculty_coordinator_designation: "Associate Professor, CSE Department",
      owner_id: DEMO_USER_ID,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: DEMO_USER2_ID,
      name: "Tech Innovators Club",
      about:
        "The premier tech club at MLRIT focused on cutting-edge technology, open source contributions, and real-world projects.",
      faculty_coordinator: "Prof. Sunita Sharma",
      faculty_coordinator_designation: "Assistant Professor, IT Department",
      owner_id: DEMO_USER2_ID,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  if (clubsErr) console.warn("  ⚠ clubs:", clubsErr.message);
  else console.log("  ✓ clubs inserted");

  // 3. Events
  console.log("3. Inserting events...");
  const events = [
    {
      id: EVENT_IDS[0],
      name: "HackFest 2025",
      theme: "Innovation & Technology",
      start_datetime: "2025-09-15T09:00:00+05:30",
      end_datetime: "2025-09-16T18:00:00+05:30",
      estimated_participants: 200,
      estimated_budget: 50000,
      event_type: "free",
      status: "approved",
      hosted: "self",
      club_id: DEMO_USER_ID,
      venue: "MLR Institute of Technology, Main Auditorium",
      city: "Hyderabad",
      country: "India",
      additional_details:
        "24-hour hackathon open to all students. Build innovative solutions for real-world problems.",
      banners: {
        "16:9":
          "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1280&q=80",
        "1x1":
          "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: EVENT_IDS[1],
      name: "AI Workshop Series",
      theme: "Artificial Intelligence & Machine Learning",
      start_datetime: "2025-10-05T10:00:00+05:30",
      end_datetime: "2025-10-05T17:00:00+05:30",
      estimated_participants: 100,
      estimated_budget: 15000,
      event_type: "free",
      status: "approved",
      hosted: "self",
      club_id: DEMO_USER_ID,
      venue: "MLR Institute of Technology, Seminar Hall",
      city: "Hyderabad",
      country: "India",
      additional_details:
        "Hands-on workshop covering ML, Deep Learning, and Generative AI fundamentals.",
      banners: {
        "16:9":
          "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1280&q=80",
        "1x1":
          "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: EVENT_IDS[2],
      name: "Web Development Bootcamp",
      theme: "Full Stack Development",
      start_datetime: "2025-11-10T09:00:00+05:30",
      end_datetime: "2025-11-12T17:00:00+05:30",
      estimated_participants: 80,
      estimated_budget: 20000,
      event_type: "paid",
      status: "approved",
      hosted: "self",
      club_id: DEMO_USER2_ID,
      venue: "MLR Institute of Technology, Lab Block 3",
      city: "Hyderabad",
      country: "India",
      additional_details:
        "3-day intensive bootcamp covering React, Next.js, Node.js, and cloud deployment.",
      banners: {
        "16:9":
          "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=1280&q=80",
        "1x1":
          "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=600&q=80",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: EVENT_IDS[3],
      name: "IIC Speaker Series: Startup Ecosystem",
      theme: "Entrepreneurship",
      start_datetime: "2025-08-20T11:00:00+05:30",
      end_datetime: "2025-08-20T14:00:00+05:30",
      estimated_participants: 300,
      estimated_budget: 10000,
      event_type: "free",
      status: "approved",
      hosted: "iic",
      club_id: DEMO_USER_ID,
      venue: "MLR Institute of Technology, Seminar Hall",
      city: "Hyderabad",
      country: "India",
      additional_details:
        "Industry leaders share insights on building successful startups in India.",
      banners: {
        "16:9":
          "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1280&q=80",
        "1x1":
          "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: EVENT_IDS[4],
      name: "Cybersecurity Summit",
      theme: "Information Security",
      start_datetime: "2025-12-01T09:00:00+05:30",
      end_datetime: "2025-12-01T18:00:00+05:30",
      estimated_participants: 150,
      estimated_budget: 30000,
      event_type: "free",
      status: "pending_approval",
      hosted: "self",
      club_id: DEMO_USER2_ID,
      venue: "MLR Institute of Technology, Conference Hall",
      city: "Hyderabad",
      country: "India",
      additional_details:
        "Summit bringing together security experts to discuss modern threats and defense strategies.",
      banners: {
        "16:9":
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1280&q=80",
        "1x1":
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const { error: eventsErr } = await supabase.from("events").upsert(events);
  if (eventsErr) console.warn("  ⚠ events:", eventsErr.message);
  else console.log(`  ✓ ${events.length} events inserted`);

  // 4. Student Council
  console.log("4. Inserting student council...");
  const { error: scErr } = await supabase.from("student_council").upsert([
    {
      id: "sc000001-0000-4000-a000-000000000001",
      club_id: DEMO_USER_ID,
      role: "President",
      name: "Arjun Patel",
      email: "arjun.patel@mlrit.ac.in",
      discipline: "Computer Science",
      semester: "6",
      stream: "B.Tech",
      year: 3,
      association_with: "IIC",
    },
    {
      id: "sc000001-0000-4000-a000-000000000002",
      club_id: DEMO_USER_ID,
      role: "Vice President",
      name: "Priya Sharma",
      email: "priya.sharma@mlrit.ac.in",
      discipline: "Information Technology",
      semester: "4",
      stream: "B.Tech",
      year: 2,
      association_with: "IIC",
    },
    {
      id: "sc000001-0000-4000-a000-000000000003",
      club_id: DEMO_USER_ID,
      role: "Technical Lead",
      name: "Ravi Kiran",
      email: "ravi.kiran@mlrit.ac.in",
      discipline: "Computer Science",
      semester: "8",
      stream: "B.Tech",
      year: 4,
      association_with: "MLRIT",
    },
    {
      id: "sc000001-0000-4000-a000-000000000004",
      club_id: DEMO_USER2_ID,
      role: "President",
      name: "Sneha Reddy",
      email: "sneha.reddy@mlrit.ac.in",
      discipline: "Electronics & Communication",
      semester: "6",
      stream: "B.Tech",
      year: 3,
      association_with: "IIC",
    },
  ]);
  if (scErr) console.warn("  ⚠ student_council:", scErr.message);
  else console.log("  ✓ student council inserted");

  // 5. Faculty Council
  console.log("5. Inserting faculty council...");
  const { error: fcErr } = await supabase.from("faculty_council").upsert([
    {
      id: "fc000001-0000-4000-a000-000000000001",
      club_id: DEMO_USER_ID,
      role: "Faculty Coordinator",
      name: "Dr. Ramesh Kumar",
      phone: "9876543210",
      email: "ramesh.kumar@mlrit.ac.in",
      department: "Computer Science & Engineering",
      designation: "Associate Professor",
      qualification: "Ph.D. (Computer Science)",
      experience: 12,
    },
    {
      id: "fc000001-0000-4000-a000-000000000002",
      club_id: DEMO_USER_ID,
      role: "Faculty Advisor",
      name: "Dr. Lakshmi Prasad",
      phone: "9876543211",
      email: "lakshmi.prasad@mlrit.ac.in",
      department: "Information Technology",
      designation: "Professor",
      qualification: "Ph.D. (IT)",
      experience: 18,
    },
    {
      id: "fc000001-0000-4000-a000-000000000003",
      club_id: DEMO_USER2_ID,
      role: "Faculty Coordinator",
      name: "Prof. Sunita Sharma",
      phone: "9876543212",
      email: "sunita.sharma@mlrit.ac.in",
      department: "Information Technology",
      designation: "Assistant Professor",
      qualification: "M.Tech (Software Engineering)",
      experience: 7,
    },
  ]);
  if (fcErr) console.warn("  ⚠ faculty_council:", fcErr.message);
  else console.log("  ✓ faculty council inserted");

  // 6. Tickets (for paid event)
  console.log("6. Inserting event tickets...");
  const { error: ticketsErr } = await supabase.from("event_tickets").upsert([
    {
      id: "tk000001-0000-4000-a000-000000000001",
      event_id: EVENT_IDS[2],
      name: "General Pass",
      class: "general",
      price: 499,
      inclusions: [
        "3-day access",
        "Certificate of completion",
        "Lunch included",
      ],
      available: 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "tk000001-0000-4000-a000-000000000002",
      event_id: EVENT_IDS[2],
      name: "VIP Pass",
      class: "vip",
      price: 999,
      inclusions: [
        "3-day access",
        "Certificate of completion",
        "Lunch included",
        "Workshop kit",
        "Networking dinner",
      ],
      available: 20,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  if (ticketsErr) console.warn("  ⚠ event_tickets:", ticketsErr.message);
  else console.log("  ✓ tickets inserted");

  // 7. Coupons
  console.log("7. Inserting event coupons...");
  const { error: couponsErr } = await supabase.from("event_coupons").upsert([
    {
      id: "cp000001-0000-4000-a000-000000000001",
      event_id: EVENT_IDS[2],
      code: "DEMO20",
      discount: 20,
      type: "percentage",
      max_uses: 50,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "cp000001-0000-4000-a000-000000000002",
      event_id: EVENT_IDS[2],
      code: "EARLY100",
      discount: 100,
      type: "fixed",
      max_uses: 10,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  if (couponsErr) console.warn("  ⚠ event_coupons:", couponsErr.message);
  else console.log("  ✓ coupons inserted");

  console.log("\n✅ Seeding complete!\n");
  console.log("Demo Login Credentials:");
  console.log("  Email:    demo@example.com");
  console.log("  Password: password123 (any password works)");
  console.log("\nData inserted for clubs:");
  console.log("  • Demo Innovation Club  (3 self-driven + 1 IIC events)");
  console.log("  • Tech Innovators Club  (1 paid event + 1 pending event)");
}

seed().catch(console.error);

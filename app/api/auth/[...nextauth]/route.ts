import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createOrUpdateUser } from "@/app/actions/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Fail fast at startup: NEXTAUTH_SECRET must be set explicitly.
// A missing secret means every JWT token could be forged with the
// hardcoded fallback that used to live here — that fallback is gone.
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    "Missing environment variable: NEXTAUTH_SECRET must be set to a strong, " +
      "randomly-generated string (e.g. `openssl rand -base64 32`). " +
      "The application will not start without it."
  );
}

export const authOptions: NextAuthOptions = {
  // process.env.NEXTAUTH_SECRET is guaranteed non-null by the check above.
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "user@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Both fields are required.
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        if (!email) return null;

        // Look up the user by email using the admin client (bypasses RLS so
        // this works even before the user has an active session).
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("id, email, full_name, avatar_url, password_hash")
          .eq("email", email)
          .maybeSingle();

        if (error) {
          console.error("[NextAuth] DB lookup error during authorize");
          return null;
        }

        // No user found with this email.
        if (!user) return null;

        // Reject if no password has been set for this account
        // (e.g. the account was created via a different flow with no hash).
        if (!user.password_hash) return null;

        // Constant-time bcrypt comparison — returns false on mismatch.
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );
        if (!passwordMatch) return null;

        // Return the user's actual ID from the DB row — never re-hash it.
        // Re-hashing would produce a different UUID every time, causing
        // duplicate user rows on every login.
        return {
          id: user.id,
          name: user.full_name ?? email.split("@")[0],
          email: user.email,
          image: user.avatar_url ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      // Upsert the user profile into our own users table.
      // We intentionally do NOT log the full user/account objects here
      // as they contain PII (email, name, avatar URL).
      if (user?.id && user?.email) {
        try {
          await createOrUpdateUser({
            id: user.id,
            email: user.email,
            name: user.name ?? user.email.split("@")[0] ?? "User",
            image: user.image,
          });
        } catch (_) {
          console.error("[NextAuth] createOrUpdateUser failed");
          // Returning false would block sign-in; log and continue so the
          // user is not silently locked out by a transient DB error.
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // Attach the user's stable ID to the token on first sign-in only.
      if (user) {
        token.sub = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // Expose the stable ID on the session object for use in API routes.
      if (session.user) {
        session.user.id = token.sub ?? "";
      }
      // Do NOT log session here — it contains email and other PII.
      return session;
    },
  },

  session: { strategy: "jwt" },

  // Only enable NextAuth's verbose debug output in local development.
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

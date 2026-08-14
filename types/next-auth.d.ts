import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** Stable UUID derived from the user's email via uuidv5. */
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}

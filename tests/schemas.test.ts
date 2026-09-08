/**
 * tests/schemas.test.ts
 *
 * Unit tests for API validation schemas in lib/api/schemas.ts.
 */

import { describe, it, expect } from "vitest";
import {
  registerSchema,
  createEventSchema,
  storageUploadSchema,
  storageDeleteSchema,
  patchMeSchema,
  ALLOWED_STORAGE_BUCKETS,
} from "@/lib/api/schemas";

describe("lib/api/schemas.ts — validation edge cases", () => {
  describe("registerSchema", () => {
    it("validates and transforms valid registration payload", () => {
      const valid = {
        email: "  STUDENT@MLRIT.AC.IN  ",
        password: "securepassword123",
        full_name: "  John Doe  ",
      };
      const parsed = registerSchema.parse(valid);
      expect(parsed.email).toBe("student@mlrit.ac.in");
      expect(parsed.full_name).toBe("John Doe");
      expect(parsed.password).toBe("securepassword123");
    });

    it("rejects invalid email formats", () => {
      const invalid = {
        email: "not-an-email",
        password: "securepassword123",
        full_name: "John Doe",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address");
      }
    });

    it("rejects passwords shorter than 8 characters", () => {
      const invalid = {
        email: "user@example.com",
        password: "short",
        full_name: "John Doe",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Password must be at least 8 characters"
        );
      }
    });

    it("rejects passwords longer than 128 characters", () => {
      const invalid = {
        email: "user@example.com",
        password: "a".repeat(129),
        full_name: "John Doe",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password is too long");
      }
    });

    it("rejects empty full name", () => {
      const invalid = {
        email: "user@example.com",
        password: "password123",
        full_name: "   ",
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Full name is required");
      }
    });
  });

  describe("createEventSchema", () => {
    const validEvent = {
      name: "Hackathon 2026",
      theme: "AI Innovation",
      start_datetime: "2026-10-01T09:00:00Z",
      end_datetime: "2026-10-02T18:00:00Z",
      estimated_participants: 150,
      estimated_budget: 5000,
      club_id: "a0000000-0000-4000-8000-000000000001",
      event_type: "free",
    };

    it("validates a fully compliant event payload", () => {
      const result = createEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("rejects end_datetime earlier than start_datetime", () => {
      const invalid = {
        ...validEvent,
        start_datetime: "2026-10-02T18:00:00Z",
        end_datetime: "2026-10-01T09:00:00Z",
      };
      const result = createEventSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "End datetime must be after start datetime"
        );
      }
    });

    it("rejects non-ISO datetime formats", () => {
      const invalid = {
        ...validEvent,
        start_datetime: "not-a-date",
      };
      const result = createEventSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "must be a valid ISO-8601 datetime"
        );
      }
    });

    it("rejects non-positive estimated participants", () => {
      const invalid = {
        ...validEvent,
        estimated_participants: 0,
      };
      const result = createEventSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "must be greater than 0"
        );
      }
    });

    it("rejects negative estimated budget but accepts 0", () => {
      const withZero = {
        ...validEvent,
        estimated_budget: 0,
      };
      expect(createEventSchema.safeParse(withZero).success).toBe(true);

      const withNegative = {
        ...validEvent,
        estimated_budget: -100,
      };
      const result = createEventSchema.safeParse(withNegative);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "must be 0 or greater"
        );
      }
    });

    it("rejects invalid club_id format", () => {
      const invalid = {
        ...validEvent,
        club_id: "not-a-uuid",
      };
      const result = createEventSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Must be a valid UUID");
      }
    });

    it("rejects unknown event_type", () => {
      const invalid = {
        ...validEvent,
        event_type: "exclusive",
      };
      const result = createEventSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Event type must be "free" or "paid"'
        );
      }
    });
  });

  describe("storageUploadSchema and storageDeleteSchema", () => {
    it("accepts each permitted storage bucket", () => {
      for (const bucket of ALLOWED_STORAGE_BUCKETS) {
        const payload = { bucket, path: "user-123/file.png" };
        expect(storageUploadSchema.safeParse(payload).success).toBe(true);
        expect(storageDeleteSchema.safeParse(payload).success).toBe(true);
      }
    });

    it("rejects unpermitted bucket names", () => {
      const invalid = {
        bucket: "unauthorized-bucket",
        path: "user-123/file.png",
      };
      const result = storageUploadSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Bucket must be one of:"
        );
      }
    });

    it("rejects directory traversal attempts with '..'", () => {
      const traversal = {
        bucket: "event-reports",
        path: "user-123/../../secret.txt",
      };
      const uploadResult = storageUploadSchema.safeParse(traversal);
      expect(uploadResult.success).toBe(false);
      if (!uploadResult.success) {
        expect(uploadResult.error.issues[0].message).toBe(
          "Path must not contain '..' directory traversal"
        );
      }

      const deleteResult = storageDeleteSchema.safeParse(traversal);
      expect(deleteResult.success).toBe(false);
      if (!deleteResult.success) {
        expect(deleteResult.error.issues[0].message).toBe(
          "Path must not contain '..' directory traversal"
        );
      }
    });

    it("rejects empty or whitespace-only paths", () => {
      const empty = { bucket: "event-reports", path: "   " };
      expect(storageUploadSchema.safeParse(empty).success).toBe(false);
      expect(storageDeleteSchema.safeParse(empty).success).toBe(false);
    });
  });

  describe("patchMeSchema", () => {
    it("accepts valid partial profile updates", () => {
      const valid = {
        first_name: "Alice",
        last_name: "Smith",
        phone_number: "+1 555-123-4567",
      };
      const result = patchMeSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("accepts nullable fields for resetting profile data", () => {
      const nullable = {
        first_name: null,
        last_name: null,
        phone_number: null,
      };
      const result = patchMeSchema.safeParse(nullable);
      expect(result.success).toBe(true);
    });

    it("rejects invalid characters in phone_number", () => {
      const invalid = {
        phone_number: "call-me-maybe-1234",
      };
      const result = patchMeSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Phone number contains invalid characters"
        );
      }
    });

    it("strictly rejects unexpected fields to prevent unauthorized column updates", () => {
      const extraFields = {
        first_name: "Bob",
        role: "admin",
      };
      const result = patchMeSchema.safeParse(extraFields);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Unexpected fields in request body"
        );
      }
    });
  });
});

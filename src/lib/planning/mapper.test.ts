import { describe, expect, it } from "vitest";
import {
  mapCalendarEventRecord,
  mapTaskRecord,
  toCalendarEventWrite,
  toTaskWrite,
} from "./mapper";

describe("planning database mapping", () => {
  it("maps database enums and nullable fields to domain values", () => {
    expect(
      mapCalendarEventRecord({
        id: "event-1",
        user_id: "user-1",
        application_id: null,
        event_type: "follow_up",
        title: "Follow up",
        starts_at: "2026-09-10T00:00:00.000Z",
        ends_at: "2026-09-10T01:00:00.000Z",
        all_day: false,
        location: null,
        description: null,
        created_at: "2026-09-01T00:00:00.000Z",
        updated_at: "2026-09-01T00:00:00.000Z",
      }),
    ).toMatchObject({ type: "follow-up", applicationId: undefined });
    expect(
      mapTaskRecord({
        id: "task-1",
        user_id: "user-1",
        application_id: null,
        title: "Prepare",
        description: null,
        priority: "high",
        status: "in_progress",
        due_at: null,
        completed_at: null,
        created_at: "2026-09-01T00:00:00.000Z",
        updated_at: "2026-09-01T00:00:00.000Z",
      }),
    ).toMatchObject({ status: "in-progress", dueAt: undefined });
  });

  it("maps domain writes back to database enums and nulls", () => {
    expect(
      toCalendarEventWrite({
        title: " Follow up ",
        type: "follow-up",
        startsAt: "2026-09-10T00:00:00.000Z",
        endsAt: "2026-09-10T01:00:00.000Z",
        allDay: false,
      }),
    ).toMatchObject({
      title: "Follow up",
      event_type: "follow_up",
      application_id: null,
    });
    expect(
      toTaskWrite({
        title: "Prepare",
        priority: "medium",
        status: "in-progress",
      }),
    ).toMatchObject({
      status: "in_progress",
      completed_at: null,
      due_at: null,
    });
  });
});

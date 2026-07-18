// @vitest-environment jsdom
/**
 * Render test for the admin audit-log page.
 *
 * The unit tests cover the filter→query mapping in isolation; this drives the
 * real page in a DOM: it types into the actor-id and entity-id inputs and
 * asserts those values actually reach `listAuditEvents` and the CSV export — the
 * wiring that type-checking alone cannot prove.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { listAuditEvents, exportAuditEventsCsv } = vi.hoisted(() => ({
  listAuditEvents: vi.fn(),
  exportAuditEventsCsv: vi.fn(),
}));

vi.mock("@/lib/api/admin", () => ({
  listAuditEvents,
  exportAuditEventsCsv,
  auditExportFilename: () => "sentinel-audit-test.csv",
}));

vi.mock("@/lib/api/client", () => ({
  isSentinelApiError: () => false,
}));

import AdminAuditPage from "@/app/admin/audit/page";

const EMPTY = { events: [], total: 0, page: 1, pageSize: 50 };

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminAuditPage filters", () => {
  it("passes actor_id and entity_id to listAuditEvents when their inputs are filled", async () => {
    listAuditEvents.mockResolvedValue(EMPTY);
    const user = userEvent.setup();
    render(<AdminAuditPage />);

    await waitFor(() => expect(listAuditEvents).toHaveBeenCalled());

    await user.type(screen.getByPlaceholderText(/actor id/i), "u-123");
    await user.type(screen.getByPlaceholderText(/entity id/i), "a-9");

    await waitFor(() => {
      const last = listAuditEvents.mock.calls.at(-1)?.[0] as
        | { actorId?: string; entityId?: string }
        | undefined;
      expect(last).toMatchObject({ actorId: "u-123", entityId: "a-9" });
    });
  });

  it("the CSV export honours the actor-id and entity-id filters", async () => {
    listAuditEvents.mockResolvedValue({ ...EMPTY, total: 3 });
    exportAuditEventsCsv.mockResolvedValue("id,action\r\n");
    const createObjectURL = vi.fn(() => "blob:x");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });

    const user = userEvent.setup();
    render(<AdminAuditPage />);
    await waitFor(() => expect(listAuditEvents).toHaveBeenCalled());

    await user.type(screen.getByPlaceholderText(/actor id/i), "u-7");
    await user.type(screen.getByPlaceholderText(/entity id/i), "a-2");
    await user.click(screen.getByRole("button", { name: /export csv/i }));

    await waitFor(() => {
      expect(exportAuditEventsCsv).toHaveBeenCalledWith(
        expect.objectContaining({ actorId: "u-7", entityId: "a-2" }),
      );
    });
    vi.unstubAllGlobals();
  });
});

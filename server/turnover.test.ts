import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("turnover.getProviders", () => {
  it("returns list of supported providers", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const providers = await caller.turnover.getProviders();

    expect(providers).toBeInstanceOf(Array);
    expect(providers.length).toBeGreaterThan(0);
    expect(providers).toContain("MEGA888");
    expect(providers).toContain("PRAGMATIC SLOT");
  });
});

describe("turnover.getBrands", () => {
  it("returns list of supported brands", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const brands = await caller.turnover.getBrands();

    expect(brands).toBeInstanceOf(Array);
    expect(brands.length).toBeGreaterThan(0);
    expect(brands).toContain("WBSG");
    expect(brands).toContain("ABSG");
  });
});

describe("activityLogs.getMyLogs", () => {
  it("returns activity logs for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const logs = await caller.activityLogs.getMyLogs({ limit: 10 });

    expect(logs).toBeInstanceOf(Array);
    // Logs might be empty for new user, so just check it's an array
  });

  it("respects limit parameter", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const logs = await caller.activityLogs.getMyLogs({ limit: 5 });

    expect(logs).toBeInstanceOf(Array);
    expect(logs.length).toBeLessThanOrEqual(5);
  });
});

describe("activityLogs.getAllLogs", () => {
  it("throws error for non-admin user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.activityLogs.getAllLogs({ limit: 10 })).rejects.toThrow(
      "Unauthorized: Admin access required"
    );
  });

  it("returns all logs for admin user", async () => {
    const { ctx } = createAuthContext();
    // Make user admin
    ctx.user!.role = "admin";
    const caller = appRouter.createCaller(ctx);

    const logs = await caller.activityLogs.getAllLogs({ limit: 10 });

    expect(logs).toBeInstanceOf(Array);
  });
});

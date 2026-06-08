/**
 * @jest-environment node
 *
 * auth-callback-route.test.ts
 *
 * Unit tests for app/auth/callback/route.ts
 */

const cookiesSetMock = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    set: (...args: unknown[]) => cookiesSetMock(...args),
    getAll: jest.fn(() => []),
  })),
}));

const exchangeCodeForSessionMock = jest.fn();

jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      exchangeCodeForSession: (...args: unknown[]) => exchangeCodeForSessionMock(...args),
    },
  })),
}));

import { GET } from "@/app/auth/callback/route";

describe("auth callback route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to /dashboard when exchange succeeds", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({
      error: null,
      data: { session: { provider_token: "ptok" } },
    });

    const req = new Request("http://localhost/auth/callback?code=abc");
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/dashboard");
    expect(cookiesSetMock).toHaveBeenCalledWith("g_provider_token", "ptok", expect.objectContaining({ httpOnly: true, path: "/" }));
  });

  it("redirects to /login?error=auth-failed when missing code", async () => {
    const req = new Request("http://localhost/auth/callback");
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/login?error=auth-failed");
  });
});

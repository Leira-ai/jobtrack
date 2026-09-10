import type { BrowserContext } from "@playwright/test";

const session = {
  access_token: "jobtrack-e2e-access-token",
  refresh_token: "jobtrack-e2e-refresh-token",
  expires_in: 3600,
  expires_at: 1_893_456_000,
  token_type: "bearer",
  user: {
    id: "00000000-0000-4000-8000-000000000001",
    aud: "authenticated",
    role: "authenticated",
    email: "demo@jobtrack.test",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: { full_name: "Alya Larasati" },
  },
};

export async function authenticate(context: BrowserContext) {
  const encoded = Buffer.from(JSON.stringify(session)).toString("base64url");
  await context.addCookies([
    {
      name: "jobtrack-demo",
      value: "1",
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    },
    {
      name: "sb-127-auth-token",
      value: `base64-${encoded}`,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: false,
      sameSite: "Lax",
      secure: false,
    },
  ]);
}

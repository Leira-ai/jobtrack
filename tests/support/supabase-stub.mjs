import { createServer } from "node:http";

const port = Number(process.env.JOBTRACK_AUTH_STUB_PORT ?? 54329);
const user = {
  id: "00000000-0000-4000-8000-000000000001",
  aud: "authenticated",
  role: "authenticated",
  email: "demo@jobtrack.test",
  email_confirmed_at: "2026-09-08T00:00:00.000Z",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: { full_name: "Alya Larasati" },
  identities: [],
  created_at: "2026-09-08T00:00:00.000Z",
  updated_at: "2026-09-08T00:00:00.000Z",
};

const server = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end("ok");
    return;
  }

  if (
    request.method === "GET" &&
    request.url?.startsWith(
      "/rest/v1/profiles?select=onboarding_completed&id=eq.",
    )
  ) {
    response.writeHead(200, {
      "content-type": "application/json",
      "content-range": "0-0/1",
    });
    response.end(JSON.stringify([{ onboarding_completed: true }]));
    return;
  }

  if (
    request.method === "GET" &&
    request.url?.startsWith("/rest/v1/profiles?select=display_name&id=eq.")
  ) {
    response.writeHead(200, {
      "content-type": "application/json",
      "content-range": "0-0/1",
    });
    response.end(JSON.stringify([{ display_name: "Alya Larasati" }]));
    return;
  }

  if (
    request.method === "GET" &&
    request.url?.startsWith("/rest/v1/applications?select=")
  ) {
    response.writeHead(200, {
      "content-type": "application/json",
      "content-range": "*/0",
    });
    response.end("[]");
    return;
  }

  if (
    request.url === "/auth/v1/user" &&
    request.headers.authorization === "Bearer jobtrack-e2e-access-token"
  ) {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(user));
    return;
  }

  response.writeHead(401, { "content-type": "application/json" });
  response.end(JSON.stringify({ message: "Unauthorized" }));
});

server.listen(port, "127.0.0.1");

const stop = () => server.close(() => process.exit(0));
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

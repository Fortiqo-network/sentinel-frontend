import { type NextRequest } from "next/server";
import { GATEWAY_URL, mirrorResponse, sessionToken } from "@/lib/bff/gateway";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

/**
 * Universal BFF proxy. Forwards any `/api/*` request to the gateway, attaching
 * the session JWT (from the first-party cookie) as a Bearer token. Public
 * gateway endpoints (e.g. listings) work without a cookie; authenticated ones
 * receive the bearer the gateway expects.
 */
async function proxy(request: NextRequest, path: string[]): Promise<Response> {
  const url = `${GATEWAY_URL}/${path.join("/")}${request.nextUrl.search}`;
  const token = sessionToken(request);

  const headers: Record<string, string> = {};
  const contentType = request.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;
  const traceId = request.headers.get("x-trace-id");
  if (traceId) headers["x-trace-id"] = traceId;
  if (token) headers["authorization"] = `Bearer ${token}`;

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.text() : undefined;

  const upstream = await fetch(url, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });
  return mirrorResponse(upstream);
}

export async function GET(request: NextRequest, ctx: RouteContext): Promise<Response> {
  return proxy(request, (await ctx.params).path);
}

export async function POST(request: NextRequest, ctx: RouteContext): Promise<Response> {
  return proxy(request, (await ctx.params).path);
}

export async function PUT(request: NextRequest, ctx: RouteContext): Promise<Response> {
  return proxy(request, (await ctx.params).path);
}

export async function PATCH(request: NextRequest, ctx: RouteContext): Promise<Response> {
  return proxy(request, (await ctx.params).path);
}

export async function DELETE(request: NextRequest, ctx: RouteContext): Promise<Response> {
  return proxy(request, (await ctx.params).path);
}

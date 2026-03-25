import { NextResponse } from "next/server";
import { fetchWithUpstreamService } from "@/lib/serviceClient";
import { readEnv } from "@/lib/readEnv";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path =
    searchParams.get("path") ?? readEnv("EXTERNAL_API_PATH") ?? "/";

  try {
    const res = await fetchWithUpstreamService(path, { method: "GET" });
    const contentType = res.headers.get("content-type") ?? "";
    let body: unknown;
    if (contentType.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      path,
      body,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

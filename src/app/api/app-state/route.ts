import { NextResponse } from "next/server";
import type { TaskStoreSnapshot } from "@/store/task-store";

const appStateId = "default";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_APP_STATE_TABLE ?? "app_state";

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    restUrl: `${url.replace(/\/$/, "")}/rest/v1/${table}`,
    serviceRoleKey,
  };
}

function getHeaders(serviceRoleKey: string) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };
}

export async function GET() {
  const config = getSupabaseConfig();

  if (!config) {
    return NextResponse.json({
      configured: false,
      data: null,
    });
  }

  const response = await fetch(`${config.restUrl}?id=eq.${appStateId}&select=data&limit=1`, {
    headers: getHeaders(config.serviceRoleKey),
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        configured: true,
        error: "DB 상태를 불러오지 못했습니다.",
      },
      { status: response.status },
    );
  }

  const rows = (await response.json()) as Array<{ data: TaskStoreSnapshot }>;

  return NextResponse.json({
    configured: true,
    data: rows[0]?.data ?? null,
  });
}

export async function PUT(request: Request) {
  const config = getSupabaseConfig();

  if (!config) {
    return NextResponse.json({
      configured: false,
      saved: false,
    });
  }

  const snapshot = (await request.json()) as TaskStoreSnapshot;
  const response = await fetch(`${config.restUrl}?on_conflict=id`, {
    method: "POST",
    headers: {
      ...getHeaders(config.serviceRoleKey),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: appStateId,
      data: snapshot,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        configured: true,
        error: "DB 상태를 저장하지 못했습니다.",
      },
      { status: response.status },
    );
  }

  return NextResponse.json({
    configured: true,
    saved: true,
  });
}

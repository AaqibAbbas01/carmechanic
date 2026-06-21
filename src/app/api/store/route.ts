import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export async function GET() {
  try {
    const sql = getSql();
    await sql`
      create table if not exists app_state (
        key text primary key,
        value jsonb not null,
        updated_at timestamptz not null default now()
      )
    `;
    const rows = (await sql`select value from app_state where key = 'main' limit 1`) as Array<{ value: unknown }>;
    return NextResponse.json({ store: rows[0]?.value || null });
  } catch (error) {
    return NextResponse.json(
      { store: null, error: error instanceof Error ? error.message : "Database unavailable" },
      { status: 200 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const store = await request.json();
    const sql = getSql();
    await sql`
      create table if not exists app_state (
        key text primary key,
        value jsonb not null,
        updated_at timestamptz not null default now()
      )
    `;
    await sql`
      insert into app_state (key, value, updated_at)
      values ('main', ${JSON.stringify(store)}::jsonb, now())
      on conflict (key) do update set value = excluded.value, updated_at = now()
    `;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Database unavailable" },
      { status: 500 },
    );
  }
}

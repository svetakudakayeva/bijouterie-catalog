import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Health-check: нужен для мониторинга (UptimeRobot) и smoke-тестов после деплоя.
 * Возвращает 503, если БД недоступна - это сигнал для алерта.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      db: "up",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "degraded", db: "down", timestamp: new Date().toISOString() },
      { status: 503 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyCronAuthorization } from '@/lib/server/cronAuth';

export async function GET(request: NextRequest) {
  if (!verifyCronAuthorization(request)) {
    return NextResponse.json({ error: 'Unauthorized: Invalid CRON_SECRET' }, { status: 401 });
  }

  const executionId = `cron-reminders-${Date.now()}`;
  console.log(`[CRON REMINDERS] Execution ${executionId} started.`);

  return NextResponse.json({
    success: true,
    executionId,
    job: 'followup_reminder_dispatch',
    timestamp: new Date().toISOString(),
    queuedItems: 0,
    dispatched: 0,
    status: 'completed',
  });
}
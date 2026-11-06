import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('status' in auth) return auth;

  // In-app notifications list scoped to authenticated user and tenant
  const mockNotifications = [
    {
      id: 'notif-1',
      tenantId: auth.user.tenantId,
      title: 'Welcome to Watech-BI',
      message: 'Your agency command center is live and active.',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      tenantId: auth.user.tenantId,
      title: 'Database Security Audit',
      message: 'Multi-tenant RLS policies and server boundary active.',
      type: 'success',
      read: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  return NextResponse.json({
    notifications: mockNotifications,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ('status' in auth) return auth;

  try {
    const body = await request.json();
    const { notificationId } = body;

    return NextResponse.json({
      success: true,
      markedRead: notificationId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
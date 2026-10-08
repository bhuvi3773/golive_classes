import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookie();

    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all users except superadmins
    const users = await prisma.user.findMany({
      where: { role: { not: 'superadmin' } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, isBlocked: true, createdAt: true, profileSetupCompleted: true }
    });
      
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Fetch Users Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

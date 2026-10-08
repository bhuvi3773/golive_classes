import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookie } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromCookie();
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.platformSetting.findFirst();
    if (!settings) {
      settings = await prisma.platformSetting.create({ data: {} });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Fetch Settings Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    let settings = await prisma.platformSetting.findFirst();
    if (!settings) {
      settings = await prisma.platformSetting.create({ data: body });
    } else {
      settings = await prisma.platformSetting.update({
        where: { id: settings.id },
        data: body
      });
    }
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Save Settings Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PlatformSetting from '@/models/PlatformSetting';
import { getUserFromCookie } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromCookie();
    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    let settings = await PlatformSetting.findOne();
    if (!settings) {
      settings = await PlatformSetting.create({});
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

    await connectToDatabase();
    const body = await req.json();
    
    let settings = await PlatformSetting.findOne();
    if (!settings) {
      settings = new PlatformSetting(body);
    } else {
      Object.assign(settings, body);
      settings.updatedAt = new Date();
    }
    
    await settings.save();
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Save Settings Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

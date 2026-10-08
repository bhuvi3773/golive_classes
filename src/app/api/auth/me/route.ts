export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/auth';


export async function GET() {
  try {
    const user = await getUserFromCookie();
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}


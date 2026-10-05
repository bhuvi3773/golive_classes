import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookie();

    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    
    // Get all users except superadmins
    const users = await User.find({ role: { $ne: 'superadmin' } })
      .select('-password -__v')
      .sort({ createdAt: -1 });
      
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Fetch Users Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

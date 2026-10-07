import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) return null;

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing");
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; role: string; email?: string; name?: string };
    
    // Add DB check for block status to ensure immediate revocation
    await connectToDatabase();
    const dbUser = await User.findById(decoded.userId).select('isBlocked');
    if (!dbUser || dbUser.isBlocked) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

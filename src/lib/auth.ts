import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

import { UserRepository } from '@/lib/repositories/user.repository';

export interface AuthUser {
  userId: string;
  role: string;
  id?: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

export async function getUserFromCookie(): Promise<AuthUser | null> {
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
    const dbUser = await UserRepository.findById(decoded.userId);
    if (!dbUser || dbUser.isBlocked) {
      return null;
    }

    // Synchronize session user with current PostgreSQL database role and attributes
    // so role updates take effect immediately and prevent stale authorization claims
    return {
      ...decoded,
      id: dbUser.id,
      userId: dbUser.id,
      role: dbUser.role,
      email: dbUser.email,
      name: dbUser.name,
    };
  } catch (error) {
    return null;
  }
}

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string; role: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

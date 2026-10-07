import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit, getIP } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const ip = getIP(req);
    if (!checkRateLimit(ip, 3, 60000)) { // 3 requests per minute
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    let { email } = await req.json();
    email = String(email);

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email });

    // For security (account enumeration prevention), always return the same generic message
    // even if the user is not found.
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a password reset link has been sent.' }, { status: 200 });
    }

    if (user.authProvider === 'google' && !user.password) {
      return NextResponse.json({ error: 'This account uses Google Login. You cannot reset a password for it.' }, { status: 400 });
    }

    // Generate crypto-secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpiresAt = resetExpires;
    await user.save();

    // Send email with the unhashed token
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({ message: 'If an account exists, a password reset link has been sent.' }, { status: 200 });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

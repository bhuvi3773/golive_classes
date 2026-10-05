import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    let { token, password } = await req.json();
    token = String(token);
    password = String(password);

    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: 'Valid token and a password of at least 6 characters are required.' }, { status: 400 });
    }

    // Hash the input token to compare with DB
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await connectToDatabase();
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpiresAt: { $gt: new Date() }, // Ensure not expired
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user and invalidate token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    
    // If they reset their password via email link, they implicitly verified their email!
    user.isVerified = true; 
    await user.save();

    return NextResponse.json({ message: 'Password has been successfully reset.' }, { status: 200 });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

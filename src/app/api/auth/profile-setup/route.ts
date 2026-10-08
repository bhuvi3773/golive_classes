import { NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/user.repository';
import { getUserFromCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const sessionUser = await getUserFromCookie();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { phone, headline, bio, github, linkedin, avatar } = await req.json();

    // Prevent malicious files / non-image files for avatar URLs
    if (avatar) {
      const blockedExtensions = /\.(exe|js|bat|sh|php|dll|msi|vbs|cmd|py|rb|pl)(\?.*)?$/i;
      if (blockedExtensions.test(avatar)) {
        return NextResponse.json({ error: 'Invalid avatar URL. Executable and suspicious files are not allowed for security reasons.' }, { status: 400 });
      }
    }

    const updatedUser = await UserRepository.update(
      sessionUser.userId,
      {
        phone,
        headline,
        bio,
        github,
        linkedin,
        avatar,
        profileSetupCompleted: true,
      }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("Profile Setup Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

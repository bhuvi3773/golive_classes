import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    // allow filtering by lectureId
    const { searchParams } = new URL(req.url);
    const lectureId = searchParams.get('lectureId');
    
    let query: any = { courseId: id };
    if (lectureId) {
      query.lectureId = parseInt(lectureId, 10);
    }

    const discussions = await prisma.discussion.findMany({
      where: query,
      include: {
        user: { select: { id: true, name: true, avatar: true, role: true } },
        replies: {
          include: { user: { select: { id: true, name: true, avatar: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(discussions, { status: 200 });
  } catch (error) {
    console.error('Fetch Discussions Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromCookie();
    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    if (body.action === 'reply') {
      const { discussionId, text } = body;
      const discussionExists = await prisma.discussion.findUnique({ where: { id: discussionId } });
      if (!discussionExists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      
      await prisma.discussionReply.create({
        data: {
          discussionId,
          userId: user.userId,
          text
        }
      });
      
      const updatedDiscussion = await prisma.discussion.findUnique({
        where: { id: discussionId },
        include: {
          user: { select: { id: true, name: true, avatar: true, role: true } },
          replies: {
            include: { user: { select: { id: true, name: true, avatar: true, role: true } } },
            orderBy: { createdAt: 'asc' }
          }
        }
      });
      
      return NextResponse.json(updatedDiscussion, { status: 201 });
    } else {
      const { lectureId, title, text } = body;
      if (!lectureId || !title || !text) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      }

      const discussion = await prisma.discussion.create({
        data: {
          courseId: id,
          lectureId,
          userId: user.userId,
          title,
          text
        }
      });

      return NextResponse.json(discussion, { status: 201 });
    }
  } catch (error) {
    console.error('Submit Discussion Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

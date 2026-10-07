import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Discussion from '@/models/Discussion';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    
    // allow filtering by lectureId
    const { searchParams } = new URL(req.url);
    const lectureId = searchParams.get('lectureId');
    
    let query: any = { courseId: id };
    if (lectureId) {
      query.lectureId = parseInt(lectureId, 10);
    }

    const discussions = await Discussion.find(query)
      .populate('userId', 'name avatar role')
      .populate('replies.userId', 'name avatar role')
      .sort({ createdAt: -1 });

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

    await connectToDatabase();
    const { id } = await context.params;
    const body = await req.json();

    if (body.action === 'reply') {
      const { discussionId, text } = body;
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      
      discussion.replies.push({
        userId: user.userId,
        text
      });
      discussion.updatedAt = new Date();
      await discussion.save();
      
      return NextResponse.json(discussion, { status: 201 });
    } else {
      const { lectureId, title, text } = body;
      if (!lectureId || !title || !text) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      }

      const discussion = new Discussion({
        courseId: id,
        lectureId,
        userId: user.userId,
        title,
        text
      });

      await discussion.save();
      return NextResponse.json(discussion, { status: 201 });
    }
  } catch (error) {
    console.error('Submit Discussion Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

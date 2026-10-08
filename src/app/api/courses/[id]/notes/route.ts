import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromCookie();
    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const lectureId = searchParams.get('lectureId');
    
    let query: any = { courseId: id, userId: user.userId };
    if (lectureId) {
      query.lectureId = parseInt(lectureId, 10);
    }

    const notes = await prisma.videoNote.findMany({
      where: query,
      orderBy: { timestamp: 'asc' }
    });

    return NextResponse.json(notes, { status: 200 });
  } catch (error) {
    console.error('Fetch Notes Error:', error);
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

    const { lectureId, timestamp, text } = body;
    if (!lectureId || timestamp === undefined || !text) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const note = await prisma.videoNote.create({
      data: {
        courseId: id,
        lectureId,
        userId: user.userId,
        timestamp,
        text
      }
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Save Note Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromCookie();
    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get('noteId');
    
    if (!noteId) {
       return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    }

    const deletedNote = await prisma.videoNote.deleteMany({
      where: { id: noteId, userId: user.userId }
    });
    
    if (deletedNote.count === 0) {
       return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete Note Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

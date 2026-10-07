import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import VideoNote from '@/models/VideoNote';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromCookie();
    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await context.params;
    
    const { searchParams } = new URL(req.url);
    const lectureId = searchParams.get('lectureId');
    
    let query: any = { courseId: id, userId: user.userId };
    if (lectureId) {
      query.lectureId = parseInt(lectureId, 10);
    }

    const notes = await VideoNote.find(query).sort({ timestamp: 1 });

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

    await connectToDatabase();
    const { id } = await context.params;
    const body = await req.json();

    const { lectureId, timestamp, text } = body;
    if (!lectureId || timestamp === undefined || !text) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const note = new VideoNote({
      courseId: id,
      lectureId,
      userId: user.userId,
      timestamp,
      text
    });

    await note.save();
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

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get('noteId');
    
    if (!noteId) {
       return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    }

    const deletedNote = await VideoNote.findOneAndDelete({ _id: noteId, userId: user.userId });
    if (!deletedNote) {
       return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete Note Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

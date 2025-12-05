import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import TranslationTask from '@/lib/models/TranslationTask';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  await connectToDatabase();
  const { taskId } = await params;
  const body = await req.json();

  try {
    const task = await TranslationTask.findByIdAndUpdate(
      taskId,
      { $set: body },
      { new: true }
    );

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

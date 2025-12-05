import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import TranslationTask from '@/lib/models/TranslationTask';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const { id } = await params;

  try {
    const tasks = await TranslationTask.find({ projectId: id }).sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const { id } = await params;
  const body = await req.json();

  try {
    const task = await TranslationTask.create({
      projectId: id,
      status: 'pending',
      totalCount: body.totalCount || 0,
      successCount: 0,
      failCount: 0,
    });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

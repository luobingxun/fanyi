import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Project from '@/lib/models/Project';
import Translation from '@/lib/models/Translation';
import Corpus from '@/lib/models/Corpus';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = params;
  const project = await Project.findById(id);
  if (!project) {
    return NextResponse.json({ error: '项目未找到' }, { status: 404 });
  }
  return NextResponse.json(project);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = params;
  // Delete project and related data
  await Translation.deleteMany({ projectId: id });
  await Corpus.deleteMany({ projectId: id });
  const project = await Project.findByIdAndDelete(id);
  
  if (!project) {
    return NextResponse.json({ error: '项目未找到' }, { status: 404 });
  }
  return NextResponse.json({ message: '项目已删除' });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    await connectToDatabase();
    const { id } = params;
    const body = await req.json();
    const project = await Project.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(project);
}

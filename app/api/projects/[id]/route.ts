import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Project from '@/lib/models/Project';
import Translation from '@/lib/models/Translation';
import Corpus from '@/lib/models/Corpus';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const { id } = await params;
  const project = await Project.findById(id);
  if (!project) {
    return NextResponse.json({ error: '项目未找到' }, { status: 404 });
  }
  return NextResponse.json(project);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const { id } = await params;
  // Delete project and related data
  await Translation.deleteMany({ projectId: id });
  await Corpus.deleteMany({ projectId: id });
  const project = await Project.findByIdAndDelete(id);
  
  if (!project) {
    return NextResponse.json({ error: '项目未找到' }, { status: 404 });
  }
  return NextResponse.json({ message: '项目已删除' });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    
    // Whitelist allowed fields for update
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.sourceLanguage !== undefined) updateData.sourceLanguage = body.sourceLanguage;
    if (body.languages !== undefined) updateData.languages = body.languages;
    if (body.deepseekApiEndpoint !== undefined) updateData.deepseekApiEndpoint = body.deepseekApiEndpoint;
    if (body.deepseekApiSecret !== undefined) updateData.deepseekApiSecret = body.deepseekApiSecret;
    if (body.systemPrompt !== undefined) updateData.systemPrompt = body.systemPrompt;

    const project = await Project.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json(project);
}

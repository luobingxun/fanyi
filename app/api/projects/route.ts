import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Project from '@/lib/models/Project';

export async function GET() {
  await connectToDatabase();
  const projects = await Project.find().sort({ createdAt: -1 });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();
  const { name } = body;
  
  if (!name) {
    return NextResponse.json({ error: '项目名称不能为空' }, { status: 400 });
  }

  try {
    const project = await Project.create({ name });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
        return NextResponse.json({ error: '项目已存在' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error creating project' }, { status: 500 });
  }
}

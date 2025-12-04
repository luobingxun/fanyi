import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Project from '@/lib/models/Project';

export async function GET(req: Request) {
  await connectToDatabase();
  
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const [projects, total] = await Promise.all([
    Project.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Project.countDocuments(query)
  ]);

  return NextResponse.json({
    projects,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  });
}

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();
  const { name, description } = body;
  
  if (!name) {
    return NextResponse.json({ error: '项目名称不能为空' }, { status: 400 });
  }

  try {
    const project = await Project.create({ name, description });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
        return NextResponse.json({ error: '项目已存在' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error creating project' }, { status: 500 });
  }
}

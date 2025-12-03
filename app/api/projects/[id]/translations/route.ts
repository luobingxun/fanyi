import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Translation from '@/lib/models/Translation';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = params;
  
  // Support pagination or search if needed, for now fetch all
  const url = new URL(req.url);
  const search = url.searchParams.get('search');
  
  const query: Record<string, unknown> = { projectId: id };
  if (search) {
    query['$or'] = [
      { key: { $regex: search, $options: 'i' } },
      // Add logic to search within values if possible, but map structure makes it harder directly without knowing keys
    ];
  }

  const translations = await Translation.find(query).sort({ createdAt: -1 });
  return NextResponse.json(translations);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = params;
  const body = await req.json();
  const { key, data } = body;

  if (!key) {
    return NextResponse.json({ error: '键名 (Key) 不能为空' }, { status: 400 });
  }

  try {
    // Upsert? Or create? Usually create.
    // Check uniqueness
    const existing = await Translation.findOne({ projectId: id, key });
    if (existing) {
        return NextResponse.json({ error: '该键名已存在于本项目中' }, { status: 400 });
    }

    const translation = await Translation.create({ projectId: id, key, data: data || {} });
    return NextResponse.json(translation, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '创建翻译失败' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    await connectToDatabase();
    const { id } = params; // projectId, though not strictly needed for update if we have translationId
    // However, RESTful wise, we might want to identify by translation ID.
    // But here let's assume we pass translation ID in body or query, or use a separate route /api/translations/[tid]
    // Let's use a separate route for single item update if possible, or handle batch update here.
    // For simplicity, I will create a separate route `app/api/translations/[id]/route.ts` for single item operations
    // OR just handle everything here if we pass _id in body.
    
    const body = await req.json();
    const { _id, data, key } = body;

    if (!_id) {
        return NextResponse.json({ error: 'ID 不能为空' }, { status: 400 });
    }

    const translation = await Translation.findByIdAndUpdate(_id, { key, data }, { new: true });
    return NextResponse.json(translation);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    await connectToDatabase();
    const { id } = params; // projectId
    const body = await req.json();
    const { ids } = body; // Array of translation IDs to delete

    if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: 'ID 列表不能为空' }, { status: 400 });
    }

    await Translation.deleteMany({ _id: { $in: ids }, projectId: id });
    return NextResponse.json({ message: '删除成功' });
}

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Corpus from '@/lib/models/Corpus';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = params;
  
  const url = new URL(req.url);
  const search = url.searchParams.get('search');
  
  const query: Record<string, unknown> = { projectId: id };
  if (search) {
    query['key'] = { $regex: search, $options: 'i' };
  }

  const corpus = await Corpus.find(query).sort({ createdAt: -1 });
  return NextResponse.json(corpus);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    await connectToDatabase();
    const { id } = params;
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: 'IDs array is required' }, { status: 400 });
    }

    await Corpus.deleteMany({ _id: { $in: ids }, projectId: id });
    return NextResponse.json({ message: 'Deleted successfully' });
}

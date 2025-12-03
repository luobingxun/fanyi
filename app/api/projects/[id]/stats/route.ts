import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Translation from '@/lib/models/Translation';
import Corpus from '@/lib/models/Corpus';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = params;
  
  const translationCount = await Translation.countDocuments({ projectId: id });
  const corpusCount = await Corpus.countDocuments({ projectId: id });
  
  // We could also get completion rate (how many translations have data for all languages)
  // But that's expensive.
  
  return NextResponse.json({
      translationCount,
      corpusCount
  });
}

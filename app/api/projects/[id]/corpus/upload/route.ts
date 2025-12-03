import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Corpus from '@/lib/models/Corpus';
import * as XLSX from 'xlsx';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { id } = params;
  
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: '未上传文件' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet);
  
  let addedCount = 0;
  let updatedCount = 0;

  for (const row of jsonData as Record<string, unknown>[]) {
    if (!row.key) continue; // Assuming 'key' is the primary identifier for corpus too (source text)

    const key = String(row.key);
    const data: Record<string, string> = {};
    
    for (const prop in row) {
        if (prop !== 'key') {
            data[prop] = String(row[prop]);
        }
    }

    const result = await Corpus.updateOne(
        { projectId: id, key: key },
        { $set: { data: data } },
        { upsert: true }
    );

    if (result.upsertedCount > 0) {
        addedCount++;
    } else if (result.modifiedCount > 0) {
        updatedCount++;
    }
  }

  return NextResponse.json({ message: '上传成功', added: addedCount, updated: updatedCount });
}

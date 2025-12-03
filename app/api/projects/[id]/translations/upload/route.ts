import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Translation from '@/lib/models/Translation';
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

  // Expected format: [{ key: 'hello', en: 'Hello', zh: '你好' }, ...]
  // We need to transform this into Translation documents
  
  let addedCount = 0;
  let updatedCount = 0;

  for (const row of jsonData as Record<string, unknown>[]) {
    if (!row.key) continue;

    const key = String(row.key);
    const data: Record<string, string> = {};
    
    // Extract languages from row, excluding 'key'
    for (const prop in row) {
        if (prop !== 'key') {
            data[prop] = String(row[prop]);
        }
    }

    // Upsert translation
    const result = await Translation.updateOne(
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

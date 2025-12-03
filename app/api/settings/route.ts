import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Settings from '@/lib/models/Settings';

export async function GET() {
  await connectToDatabase();
  // Assumes single settings document
  const settings = await Settings.findOne();
  return NextResponse.json(settings || {});
}

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();
  
  // Update or create the single settings document
  const settings = await Settings.findOneAndUpdate({}, body, { 
    new: true, 
    upsert: true 
  });
  
  return NextResponse.json(settings);
}

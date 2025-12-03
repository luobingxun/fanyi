import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    return NextResponse.json({ message: '用户创建成功' }, { status: 201 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
        return NextResponse.json({ error: '用户名已存在' }, { status: 400 });
    }
    return NextResponse.json({ error: '注册失败' }, { status: 500 });
  }
}

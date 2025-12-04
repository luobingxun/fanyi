import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, oldPassword, newPassword } = await request.json();

    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password!);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '旧密码错误' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import bcrypt from 'bcryptjs';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const { username, oldPassword, newPassword } = await request.json();

    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: '请提供完整的信息' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '新密码长度至少为6位' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user
    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.password!);
    
    if (!isValid) {
      return NextResponse.json(
        { error: '旧密码错误' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.updateOne(
      { username },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json(
      { message: '密码修改成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

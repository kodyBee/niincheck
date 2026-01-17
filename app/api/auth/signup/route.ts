import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{ email, password_hash }])
      .select()
      .single();

    if (error) {
      console.error('Signup error:', error);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Account created successfully', user: { id: data.id, email: data.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

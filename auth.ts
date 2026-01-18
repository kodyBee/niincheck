import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Helper function to get Supabase client (lazy initialization)
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    console.error('[Auth] Missing Supabase environment variables', {
      hasUrl: !!url,
      hasKey: !!key
    });
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(url, key);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const { email, password } = credentials as {
            email: string;
            password: string;
          };

          if (!email || !password) {
            console.error('[Auth] Missing email or password');
            throw new Error('Please provide email and password');
          }

          // Create Supabase client on-demand
          const supabase = getSupabaseClient();
          
          // Query the users table directly
          const { data: user, error } = await supabase
            .from('users')
            .select('id, email, password_hash')
            .eq('email', email)
            .single();

          if (error) {
            console.error('[Auth] Database error:', error.message);
            throw new Error('Invalid email or password');
          }

          if (!user) {
            console.error('[Auth] User not found:', email);
            throw new Error('Invalid email or password');
          }

          // Check if password_hash exists
          if (!user.password_hash) {
            console.error('[Auth] No password hash found for user:', email);
            throw new Error('Invalid email or password');
          }

          // Verify password
          const isValid = await bcrypt.compare(password, user.password_hash);
          
          if (!isValid) {
            console.error('[Auth] Password verification failed for:', email);
            throw new Error('Invalid email or password');
          }

          console.log('[Auth] Login successful for:', email);
          return {
            id: user.id,
            email: user.email,
          };
        } catch (error) {
          console.error('[Auth] Authorization error:', error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

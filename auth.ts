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
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(url, key);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) {
          throw new Error('Please provide email and password');
        }

        // Create Supabase client on-demand
        const supabase = getSupabaseClient();
        
        // Query the users table directly
        const { data: user, error } = await supabase
          .from('users')
          .select('id, email, password_hash, stripe_subscription_status')
          .eq('email', email)
          .single();

        if (error || !user) {
          throw new Error('Invalid email or password');
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          isSubscribed: user.stripe_subscription_status === 'active',
        };
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
        token.isSubscribed = user.isSubscribed;
      } else if (token.id) {
        // Refresh subscription status on each session check
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from('users')
          .select('stripe_subscription_status')
          .eq('id', token.id)
          .single();
        
        if (data) {
          token.isSubscribed = data.stripe_subscription_status === 'active';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isSubscribed = token.isSubscribed as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnPricing = nextUrl.pathname.startsWith('/pricing');
      const isOnLogin = nextUrl.pathname === '/login';
      const isOnSignup = nextUrl.pathname === '/signup';
      const isOnHome = nextUrl.pathname === '/';
      
      // Allow access to public pages
      if (isOnHome || isOnLogin || isOnSignup) {
        // Logged in users trying to access login/signup should go to pricing page
        if (isLoggedIn && (isOnLogin || isOnSignup)) {
          return Response.redirect(new URL('/pricing', nextUrl));
        }
        return true;
      }
      
      // For protected pages, require authentication
      if (isOnDashboard || isOnPricing) {
        if (!isLoggedIn) {
          return false; // Redirect to login page
        }
        return true;
      }
      
      return true;
    },
    async jwt({ token, user }) {
      // Add user id to token when user first signs in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id from token to session
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;

import { auth } from './auth';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from './lib/db';

export default auth(async (req) => {
  const session = req.auth;
  const { pathname, searchParams } = req.nextUrl;
  
  // Public routes that don't require subscription
  const publicRoutes = ['/', '/login', '/signup', '/pricing'];
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Allow access to public routes and API routes
  if (isPublicRoute || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Allow dashboard access immediately after checkout (with session_id)
  // This gives webhooks time to process
  if (pathname === '/dashboard' && searchParams.get('session_id')) {
    return NextResponse.next();
  }
  
  // If user is logged in, check subscription status for protected routes
  if (session?.user?.email) {
    try {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('subscription_status')
        .eq('email', session.user.email)
        .single();
      
      const hasActiveSubscription = user?.subscription_status === 'active';
      
      // If user doesn't have active subscription, redirect to pricing
      if (!hasActiveSubscription && !isPublicRoute) {
        return NextResponse.redirect(new URL('/pricing', req.url));
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // On error, redirect to pricing to be safe
      return NextResponse.redirect(new URL('/pricing', req.url));
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

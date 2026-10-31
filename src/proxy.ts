import { NextRequest, NextResponse } from 'next/server';
import { authClient, authConfigured } from './lib/admin/auth';
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    if (!authConfigured()) return NextResponse.json({error:'Authentication setup required'}, {status:503,headers:{'Cache-Control':'private, no-store'}});
    // Restrict destinations; OAuth transaction validation remains in the SDK.
    const returnTo = request.nextUrl.searchParams.get('returnTo');
    if (returnTo && !['/admin','/admin/business'].includes(returnTo)) return NextResponse.json({error:'Invalid return destination'}, {status:400});
    const response = await authClient().middleware(request);
    response.headers.set('Cache-Control','private, no-store'); return response;
  }
  const response = NextResponse.next();
  response.headers.set('Cache-Control','private, no-store, max-age=0');
  response.headers.set('X-Robots-Tag','noindex, nofollow'); return response;
}
export const config = { matcher: ['/admin/:path*','/api/admin/:path*','/auth/:path*'] };

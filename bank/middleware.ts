import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // if(request.nextUrl.pathname.startsWith('/create-account') || request.nextUrl.pathname.startsWith('/link-account') ||
  //   request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/deposit-to-wallet') || 
  // request.nextUrl.pathname.startsWith('/profile'))
  // {
  //   const token = (request.cookies.get('next-auth.session-token')?.value) || (request.cookies.get('__Secure-next-auth.session-token')?.value)
  //   if (!token) {
  //     return NextResponse.redirect(new URL('/auth/signin', request.url));
  //   }
  //   return NextResponse.next();
  // }
  
  return NextResponse.next();
    
}
// Global Matcher, want to protect website Globally
// export const config = {
//   matcher: '/:path*'
// };

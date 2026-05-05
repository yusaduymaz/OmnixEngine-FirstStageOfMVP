import { clerkMiddleware } from '@clerk/nextjs/server'

// Clerk middleware — sadece session yönetimi için
// Auth koruması client-side yapılır (clock skew sorununu bypass eder)
export default clerkMiddleware()

export const config = {
  matcher: [
    // Next.js static dosyalarını ve _next içeriğini hariç tut
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
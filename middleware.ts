import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Public rotalar — giriş gerektirmeyen sayfalar
const isPublicRoute = createRouteMatcher([
  '/',                    // Landing page
  '/hakkimizda',          // Hakkımızda sayfası
  '/hizmetlerimiz',       // Hizmetlerimiz sayfası
  '/entegrasyonlar',      // Entegrasyonlar sayfası
  '/iletisim',            // İletişim sayfası
  '/login(.*)',           // Clerk SignIn (route group: (auth)/login/[[...login]])
  '/register(.*)',        // Clerk SignUp (route group: (auth)/register/[[...register]])
  '/api/webhooks(.*)',    // Clerk & Stripe webhook'ları
  '/api/contact',         // İletişim formu API
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Next.js static dosyalarını ve _next içeriğini hariç tut
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
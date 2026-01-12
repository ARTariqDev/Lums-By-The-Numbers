import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Lums By The Numbers - LUMS Admissions Data & Statistics" },
    { name: "description", content: "Explore verified LUMS admissions data including SAT scores and O Level grades from accepted students. Get insights into admission requirements and predict your chances for MGHSS, SBASSE, SDSB, and SAHSOL." },
    { name: "keywords", content: "LUMS admissions, LUMS SAT scores, LUMS O levels, LUMS statistics, LUMS MGHSS, LUMS SBASSE, LUMS SDSB, LUMS SAHSOL, Pakistan university admissions, LUMS requirements, LUMS acceptance rate" },
    { name: "author", content: "Abdur Rehman Tariq" },
    { name: "theme-color", content: "#000000" },
    { property: "og:title", content: "Lums By The Numbers - LUMS Admissions Data & Statistics" },
    { property: "og:description", content: "Explore verified LUMS admissions data including SAT scores and O Level grades from accepted students across MGHSS, SBASSE, SDSB, and SAHSOL." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://lumsbythenumbers.vercel.app" },
    { property: "og:image", content: "https://lumsbythenumbers.vercel.app/og.png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:site_name", content: "Lums By The Numbers" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Lums By The Numbers - LUMS Admissions Data & Statistics" },
    { name: "twitter:description", content: "Explore verified LUMS admissions data including SAT scores and O Level grades from accepted students." },
    { name: "twitter:image", content: "https://lumsbythenumbers.vercel.app/og.png" },
    { name: "robots", content: "index, follow" },
    { name: "language", content: "English" },
    { name: "revisit-after", content: "7 days" },
  ];
};

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-black min-h-screen relative">
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-30 z-0">
          {[...Array(12)].map((_, i) => (
            <div 
              key={`v-${i}`}
              className="grid-line"
              style={{
                left: `${(i + 1) * 8.33}%`,
                width: '1px',
                height: '100%',
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
          {[...Array(8)].map((_, i) => (
            <div 
              key={`h-${i}`}
              className="grid-line"
              style={{
                top: `${(i + 1) * 12.5}%`,
                width: '100%',
                height: '1px',
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>

        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="bg-element" 
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }} 
            />
          ))}
        </div>

        <div className="fixed top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-white opacity-20 z-0"></div>
        <div className="fixed top-8 right-8 w-20 h-20 border-r-2 border-t-2 border-white opacity-20 z-0"></div>
        <div className="fixed bottom-8 left-8 w-20 h-20 border-l-2 border-b-2 border-white opacity-20 z-0"></div>
        <div className="fixed bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 border-white opacity-20 z-0"></div>

        <div className="relative z-10">
          {children}
        </div>
        
        <footer className="relative z-10 py-2 mt-3">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-white text-sm opacity-70">
              <p>© {new Date().getFullYear()} LUMS By The Numbers</p>
              <span className="hidden md:inline">|</span>
              <div className="flex items-center gap-2">
                <span>Made by:</span>
                <a 
                  href="https://github.com/ARTariqDev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:opacity-100 hover:text-white transition-all relative group"
                  aria-label="GitHub Profile - Abdur Rehman Tariq"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span className="relative">
                    Abdur Rehman Tariq
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </footer>
        
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

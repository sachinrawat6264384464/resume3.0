import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CloudOps AI Assessment OS | Botmartz AI Solutions Pvt Ltd",
  description: "Production-oriented AI-powered interview and skill assessment platform for Cloud Operations and DevOps Engineers by Botmartz AI Solutions Pvt Ltd.",
  keywords: ["Botmartz AI Solutions Pvt Ltd", "CloudOps AI", "DevOps Interview", "Voice AI Assessment", "AWS Cloud Simulator"],
  authors: [{ name: "Botmartz AI Solutions Pvt Ltd" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${plusJakarta.variable} ${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col selection:bg-[#FF9900] selection:text-slate-950">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}

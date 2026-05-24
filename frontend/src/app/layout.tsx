import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: {
    default: "Maadtime — Le goût naturel du maad sénégalais",
    template: "%s | Maadtime",
  },
  description:
    "Des produits locaux, naturels et de qualité à base de maad sénégalais. 100% naturel, fait au Sénégal.",
  keywords: ["maad", "sénégal", "produits naturels", "bio", "huile de maad", "savon naturel"],
  openGraph: {
    title: "Maadtime — Le goût naturel du maad sénégalais",
    description: "Des produits locaux, naturels et de qualité pour votre bien-être.",
    url: "https://maadtime.com",
    siteName: "Maadtime",
    type: "website",
    locale: "fr_SN",
  },
  metadataBase: new URL("https://maadtime.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

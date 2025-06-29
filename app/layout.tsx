import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster as SonnerToaster } from "@/components/ui/sonner"; // Renamed to avoid conflict if you have another Toaster

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AlgorithmPress Database",
  description: "Manage and showcase your products with AlgorithmPress Database. Create, view, and compare products seamlessly.",
  keywords: [
    "product management",
    "e-commerce",
    "product catalog",
    "product comparison",
    "database generator",
    "AlgorithmPress",
  ],
  openGraph: {
    title: "AlgorithmPress Database",
    description: "A comprehensive solution for managing and displaying product information, including detailed specifications and comparison features.",
    // url: "https://your-app-url.com", // Replace with your actual app URL
    siteName: "AlgorithmPress Database",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlgorithmPress Database",
    description: "Easily manage your product inventory, showcase items with rich details, and allow users to compare products.",
    // site: "@yourtwitterhandle", // Replace with your Twitter handle if applicable
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <SonnerToaster richColors position="top-right" /> {/* Use the imported SonnerToaster */}
        </ThemeProvider>
      </body>
    </html>
  );
}

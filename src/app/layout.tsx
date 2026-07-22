import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cookies } from "next/headers";
import AuthStoreProvider from "@/providers/auth-store-provider";
import { INITIAL_STATE_PROFILE } from "@/constant/auth-constant";
import ReactQueryProvider from "@/providers/react-query-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Management Surat",
  description: "Aplikasi Management Surat",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiesStore = await cookies();
  const profile = {
  ...INITIAL_STATE_PROFILE,
  ...JSON.parse(
    cookiesStore.get("user_profile")?.value ?? "{}"
  ),
};
  // const profile = JSON.parse(cookiesStore.get('user_profile')?.value ?? '{}');
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <AuthStoreProvider >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                {children}
              </TooltipProvider>
              <Toaster />
            </ThemeProvider>
          </AuthStoreProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
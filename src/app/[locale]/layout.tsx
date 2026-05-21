import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lead-Flow AI | Never Lose a Lead on WhatsApp Again",
  description: "Your 24/7 AI receptionist for local businesses. Automate lead capture, booking, and multilingual replies on WhatsApp — for real estate, salons, consultants, and agencies.",
  keywords: "WhatsApp automation, lead capture, booking automation, AI receptionist, real estate leads, salon booking, consultant CRM, agency automation, multilingual chatbot",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const messages = await getMessages();
  const resolvedParams = await params;

  return (
    <html
      lang={resolvedParams.locale}
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import ApiStatus from "@/components/ApiStatus";
import {SBStoreProvider} from "@/providers/sb-store-provider";
import {Toaster} from "@/components/ui/sonner";
import Script from "next/script";
import liveChatScript from "@/app/live-chat";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Study Buddy",
    description: "Study buddy is a web application that helps students to track their study progress.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ThemeProvider attribute="class" defaultTheme="dark">
            <SBStoreProvider>
                {children}
                <ApiStatus />
                <Toaster richColors />
            </SBStoreProvider>
        </ThemeProvider>
        <Script id="ak-tawk-script" dangerouslySetInnerHTML={{ __html: liveChatScript }} />
        </body>
        </html>
    );
}

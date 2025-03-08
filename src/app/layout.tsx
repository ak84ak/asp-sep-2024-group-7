import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import SBContextProvider from "@/components/sb-context-provider";
import ApiStatus from "@/components/ApiStatus";

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
            <SBContextProvider>
                {children}
                <ApiStatus />
            </SBContextProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}

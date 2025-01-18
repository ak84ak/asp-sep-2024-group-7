"use client"

import AppHeader from "@/components/home/AppHeader";
import SignInDialog from "@/components/home/SignInDialog";
import SBContext from "@/lib/contexts/sb-context";
import {useContext, useState} from "react";

export default function Home() {
    const ctx = useContext(SBContext);

    const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);

    return (
        <>
            <div
                className="bg-background grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
                <AppHeader onLoginClick={() => setIsSignInDialogOpen(true)} />
                <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                    MAIN PAGE
                </main>
                <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
                    FOOTER
                </footer>
            </div>
            <SignInDialog isOpen={isSignInDialogOpen} onClose={() => setIsSignInDialogOpen(false)} />
        </>
    );
}

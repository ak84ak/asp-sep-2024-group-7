"use client"

import {Context, createContext, Dispatch, SetStateAction, useState} from "react";
import AKAuroraBackground from "@/components/ui-ak/aurora-background/ak-aurora-background";
import AppHeader from "@/components/home/AppHeader";
import {HeartIcon} from "lucide-react";
import Link from "next/link";
import SignInDialog from "@/components/home/SignInDialog";

type HomeContextProps = {
    setIsSignInDialogOpen: Dispatch<SetStateAction<boolean>>;
    setSignInDialogTab: Dispatch<SetStateAction<"login" | "signup">>;
    setShowFeaturesLink: Dispatch<SetStateAction<boolean>>;
};

export const HomeContext: Context<HomeContextProps> = createContext<HomeContextProps>({} as HomeContextProps);

export default function HomeTemplate({children}: { children: React.ReactNode }) {
    const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
    const [signInDialogTab, setSignInDialogTab] = useState<"login" | "signup">("login");
    const [showFeaturesLink, setShowFeaturesLink] = useState(true);

    return (
        <HomeContext.Provider value={{setIsSignInDialogOpen, setSignInDialogTab, setShowFeaturesLink}}>
            <AKAuroraBackground/>
            <div
                className="relative z-10 grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 font-[family-name:var(--font-geist-sans)]"
            >
                <AppHeader onLoginClick={() => {
                    setSignInDialogTab("login");
                    setIsSignInDialogOpen(true);
                }}
                           showFeaturesLink={showFeaturesLink}
                />
                {children}
                <footer>
                    <div className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
                        <Link href="/terms" className="underline underline-offset-4 decoration-dashed">Terms of
                            Service</Link>
                        <Link href="/about" className="underline underline-offset-4 decoration-dashed">About</Link>
                    </div>
                    <div className="mt-3">
                        <span className="text-xs">Made with <HeartIcon className="inline size-3 mb-0.5"/> by UoL students :)</span>
                    </div>
                </footer>
            </div>
            <SignInDialog
                isOpen={isSignInDialogOpen}
                tab={signInDialogTab}
                onClose={() => setIsSignInDialogOpen(false)}/>
        </HomeContext.Provider>
    );
}
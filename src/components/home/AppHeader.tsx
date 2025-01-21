import {Button} from "@/components/ui/button";
import {ArrowRightIcon, ChevronDown, LogOutIcon} from "lucide-react";
import SBContext from "@/lib/contexts/sb-context";
import {useContext} from "react";
import {SBApiContext} from "@/lib/contexts/sb-api-context";

import Image from 'next/image';
import SBLogo from "../../assets/logo-transparent-6-w.svg";
import Link from "next/link";

type AppHeaderProperties = {
    onLoginClick?: () => void;
    showFeaturesLink: boolean;
}

export default function AppHeader(props: AppHeaderProperties) {
    const ctx = useContext(SBContext);
    const api = useContext(SBApiContext).api;

    const onLogoutClick = async () => {
        await api.logout();
        window.location.reload();
    }

    const onLoginClick = () => {
        if (props.onLoginClick) {
            props.onLoginClick();
        }
    }

    return (
        <header className="w-full mx-auto p-4 grid sm:grid-cols-3 grid-cols-2">
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                    <Image priority src={SBLogo} alt="Logo" height={45}/>
                    <span className="ml-2 text-base sm:text-lg font-semibold">Study Buddy</span>
                </Link>
            </div>
            <div className="sm:flex hidden items-center justify-evenly xs:hidden">
                {props.showFeaturesLink && (
                    <Link href="#features"
                          className="underline underline-offset-4 decoration-dashed">Features <ChevronDown
                        className="inline size-4"/></Link>
                )}
                <Link href="/terms" className="underline underline-offset-4 decoration-1">Terms of Service</Link>
                <Link href="/about" className="underline underline-offset-4 decoration-1">About</Link>
            </div>
            <div className="flex items-center justify-end">
                {ctx.isAuthenticated && ctx.isClient ? (
                    <Button variant="ghost" className="cursor-pointer text-[18px] p-5 hover:bg-indigo-900"
                            onClick={onLogoutClick}>Logout <LogOutIcon/></Button>
                ) : (
                    <Button variant="ghost" className="cursor-pointer text-[18px] p-5 hover:bg-indigo-900"
                            onClick={onLoginClick}>Login <ArrowRightIcon/></Button>
                )}
            </div>
        </header>
    );
}
import {Button, buttonVariants} from "@/components/ui/button";
import {ArrowRightIcon, ChartNoAxesCombinedIcon, ChevronDown, LogOutIcon, ShapesIcon} from "lucide-react";

import Image from 'next/image';
import SBLogo from "../../assets/logo-transparent-6-w.svg";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {useRouter} from "next/navigation";
import {useSBStore} from "@/providers/sb-store-provider";
import {cn} from "@/lib/utils";

type AppHeaderProperties = {
    onLoginClick?: () => void;
    showFeaturesLink: boolean;
}

export default function AppHeader(props: AppHeaderProperties) {
    const router = useRouter();

    const isClient = useSBStore((store) => store.isClient);
    const apiIsAuthenticated = useSBStore((store) => store.apiIsAuthenticated);
    const currentUser = useSBStore((store) => store.user);

    const apiLogout = useSBStore((store) => store.apiLogout);

    const onLogoutClick = async () => {
        await apiLogout();
        window.location.reload();
    }

    const onLoginClick = () => {
        if (props.onLoginClick) {
            props.onLoginClick();
        }
    }

    const onGoToDashboard = () => {
        router.push("/dashboard");
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
                {apiIsAuthenticated && isClient && currentUser ? (
                    <>
                        <Link href="/dashboard"
                              className={cn(buttonVariants({variant: 'ghost', size: 'lg'}), "cursor-pointer text-[18px] p-5 hover:bg-indigo-900 hidden sm:inline-flex")}
                              onClick={onGoToDashboard}>Go to Dashboard <ChartNoAxesCombinedIcon/></Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="cursor-pointer ml-2">
                                <Avatar>
                                    <AvatarFallback className="bg-primary font-semibold text-secondary"
                                    >{currentUser.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>{currentUser.login}</DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard")}>
                                    <ChartNoAxesCombinedIcon/>
                                    <Link href="/dashboard"><span>Dashboard</span></Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/modules")}>
                                    <ShapesIcon/>
                                    <Link href="/modules"><span>Modules</span></Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem className="cursor-pointer" onClick={onLogoutClick}>
                                    <LogOutIcon/>
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <Button variant="ghost" className="cursor-pointer text-[18px] p-5 hover:bg-indigo-900"
                            onClick={onLoginClick}>Login <ArrowRightIcon/></Button>
                )}
            </div>
        </header>
    );
}
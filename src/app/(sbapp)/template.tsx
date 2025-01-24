"use client"

import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {AppSidebar} from "@/components/sbapp/app-sidebar";
import AppLogin from "@/components/sbapp/app-login";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {LogOutIcon} from "lucide-react";
import {useRouter} from 'next/navigation'
import {useSBStore} from "@/providers/sb-store-provider";
import {Spinner} from "@/components/ui-ak/spinner";

export default function AppTemplate({children}: { children: React.ReactNode }) {
    const router = useRouter();

    const isClient = useSBStore((store) => store.isClient);
    const apiLogout = useSBStore((store) => store.apiLogout);
    const apiIsAuthenticated = useSBStore((store) => store.apiIsAuthenticated);
    const currentUser = useSBStore((store) => store.user);

    if (!isClient) {
        return (
            <div></div>
        );
    }

    const onLogoutClick = async () => {
        await apiLogout();
        router.push("/");
    }

    return (
        <>
            {!apiIsAuthenticated && !currentUser ? (
                <AppLogin/>
            ) : (
                !currentUser ? (
                    <div className="w-full h-[100vh] mx-auto flex flex-col items-center justify-center">
                        <div className="max-w-72">
                            <Spinner size="large"/>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-[1544px] mx-auto">
                        <SidebarProvider defaultOpen={false}>
                            <AppSidebar/>
                            <SidebarInset>
                                <header
                                    className="w-full flex h-16 shrink-0 items-center gap-2
                            transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12
                            bg-ak-topbar mb-2">
                                    <div className="flex items-center gap-2 px-4">
                                        <SidebarTrigger className="-ml-1"/>
                                        <Separator orientation="vertical" className="mr-2 h-4"/>
                                        <p>Hi, <span className="font-semibold">{currentUser.login}</span> <span
                                            className="text-lg ml-2">👋</span></p>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 ml-auto mr-1 my-auto">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="cursor-pointer">
                                                <Avatar>
                                                    <AvatarFallback className="bg-primary font-semibold text-secondary"
                                                    >{currentUser.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56">
                                                <DropdownMenuLabel>{currentUser.login}</DropdownMenuLabel>
                                                <DropdownMenuSeparator/>
                                                <DropdownMenuItem className="cursor-pointer" onClick={onLogoutClick}>
                                                    <LogOutIcon/>
                                                    <span>Log out</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </header>
                                {children}
                            </SidebarInset>
                        </SidebarProvider>
                    </div>
                )
            )}
        </>
    )
}
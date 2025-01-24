"use client"

import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter, SidebarGroup, SidebarGroupContent,
    SidebarHeader,
    SidebarMenu, SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";
import Link from "next/link";
import SBLogo from "@/assets/logo-transparent-6-w.svg";
import Image from "next/image";
import {CalendarCogIcon, ChartNoAxesCombinedIcon, CircleUserRoundIcon, ShapesIcon} from "lucide-react";
import {Separator} from "@/components/ui/separator";
import {usePathname} from "next/navigation";

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon" variant="sidebar" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" tooltip="Go to home page" asChild>
                            <Link href="/">
                                <Image priority src={SBLogo} alt="Logo" height={30}
                                       className="group-data-[state=collapsed]:mx-auto"/>
                                <span className="text-lg group-data-[state=collapsed]:hidden">Study Buddy</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Dashboard" isActive={pathname === "/dashboard"}>
                                    <Link href="/dashboard">
                                        <ChartNoAxesCombinedIcon />
                                        <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <Separator />
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Plan" isActive={pathname === "/plan"}>
                                    <Link href="/plan">
                                        <CalendarCogIcon />
                                        <span>Plan</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Modules" isActive={pathname === "/modules"}>
                                    <Link href="/modules">
                                        <ShapesIcon />
                                        <span>Modules</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <Separator />
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Account" isActive={pathname === "/account"}>
                                    <Link href="/account">
                                        <CircleUserRoundIcon />
                                        <span>Account</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
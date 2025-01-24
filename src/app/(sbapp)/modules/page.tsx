"use client"

import {useSBStore} from "@/providers/sb-store-provider";
import React, {useEffect, useRef, useState} from "react";
import {Spinner} from "@/components/ui-ak/spinner";
import {Button} from "@/components/ui/button";
import {ArrowRightIcon} from "lucide-react";
import AddModuleDialog from "@/components/sbapp/modules/add-module";
import ModulesTree from "@/components/sbapp/modules/modules-tree";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import AKSticky from "@/components/ui-ak/AKSticky";
import {useIsMobile} from "@/hooks/use-mobile";
import ModulesDetailsPanel from "@/components/sbapp/modules/modules-details-panel";

export default function ModulesPage() {
    const detailsRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    const modules = useSBStore((store) => store.modules);
    const apiLoadModules = useSBStore((store) => store.apiLoadModules);

    const [addModuleDialogOpen, setAddModuleDialogOpen] = useState(false);

    useEffect(() => {
        apiLoadModules(false).then(() => {
        });
    }, [apiLoadModules]);

    const onAddModuleClick = () => {
        setAddModuleDialogOpen(true);
    }

    const onAddModuleDialogClose = () => {
        setAddModuleDialogOpen(false);
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="px-4 pt-4">
                <h1 className="text-3xl">Modules</h1>
            </div>
            <div className="flex-1 rounded-xl bg-muted/50 md:min-h-min p-3">
                {modules === undefined ? (
                    <div className="w-full h-full mx-auto flex flex-col items-center justify-center">
                        <div><Spinner size="large"/></div>
                        <div>
                            <p className="text-lg">Loading modules...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {modules.length === 0 ? (
                            <div className="w-full h-full mx-auto flex flex-col items-center justify-center">
                                <div className="text-center">
                                    <p className="text-lg my-2">It looks like you don&apos;t have any modules setup
                                        yet.</p>
                                    <p className="text-lg my-2">Let&apos;s start with adding the first one:</p>
                                    <Button size="lg" className="my-5"
                                            onClick={onAddModuleClick}
                                    >Add first module <ArrowRightIcon/></Button>
                                </div>
                            </div>) : (
                            <div className="w-full h-full">
                                {isMobile ? (
                                    <div className="w-full h-full mx-auto flex flex-col items-center justify-center">
                                        <div className="text-center text-lg">
                                            <p>We&apos;re sorry, but the modules view is not available on mobile devices in portrait mode.</p>
                                            <p>We&apos;re working on it right now!</p>
                                            <p>As a workaround, try to rotate your device to landscape mode or use laptop/desktop or tablet.</p>
                                            <p>Sorry for the inconvenience :(</p>
                                        </div>
                                    </div>
                                ) : (
                                    <ResizablePanelGroup direction="horizontal" className="min-h-[80svh]">
                                        <ResizablePanel defaultSize={50}>
                                            <ModulesTree modules={modules} />
                                        </ResizablePanel>
                                        <ResizableHandle withHandle className="bg-indigo-900 hidden sm:flex"/>
                                        <ResizablePanel defaultSize={50}>
                                            <div ref={detailsRef} className="relative px-2">
                                                <AKSticky containerRef={detailsRef} topOffset={20} className="w-full">
                                                    <ModulesDetailsPanel />
                                                </AKSticky>
                                            </div>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                )}
                            </div>
                        )}
                        {addModuleDialogOpen && (
                            <AddModuleDialog onClose={onAddModuleDialogClose} />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
import {useSBStore} from "@/providers/sb-store-provider";
import ModulesDetailsModule from "@/components/sbapp/modules/modules-details-module";
import ModulesDetailsActivity from "@/components/sbapp/modules/modules-details-activity";
import {ArrowLeftIcon} from "lucide-react";

export default function ModulesDetailsPanel() {
    const selectedModule = useSBStore((store) => store.modulesPageSelectedModule);
    const selectedActivity = useSBStore((store) => store.modulesPageSelectedActivity);

    return (
        <>
            <div className="w-full flex flex-col gap-1">
                {selectedModule && (
                    <ModulesDetailsModule />
                )}
                {selectedActivity && (
                    <ModulesDetailsActivity />
                )}
                {!selectedModule && !selectedActivity && (
                    <div className="w-full h-full mx-auto flex flex-col items-center justify-center">
                        <div className="text-center">
                            <p className="text-lg my-2"><ArrowLeftIcon className="inline size-5" /> Select a module or activity to view details.</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
import {ICourseModule, ICourseModuleActivity} from "@/models/api/ModulesModels";
import {
    CircleCheckBigIcon,
    CircleIcon, HourglassIcon,
} from "lucide-react";

import './modules-tree-activity.css';
import {Tooltip} from 'react-tooltip'
import {format} from "date-fns";
import {useSBStore} from "@/providers/sb-store-provider";
import {cn} from "@/lib/utils";
import ActivityTypeIcon from "@/components/ui-ak/activity-type-icon";
import {Badge} from "@/components/ui/badge";
import {formatDuration} from "@/lib/ui-utils";

export type ModulesTreeActivityProperties = {
    module: ICourseModule;
    week: number;
    activity: ICourseModuleActivity;
}

export default function ModulesTreeActivity(props: ModulesTreeActivityProperties) {
    const selectedActivity = useSBStore((store) => store.modulesPageSelectedActivity);
    const setSelectedActivity = useSBStore((store) => store.setModulesPageSelectedActivity);

    return (
        <>
            <div className="w-full flex flex-row gap-2 items-center rounded-lg pr-1">
                <div>
                    {props.activity.isCompleted ? (
                        <>
                            <CircleCheckBigIcon className="stroke-green-500"
                                                data-tooltip-id={`ak-activity-completed-${props.activity.id}`}
                                                data-tooltip-delay-show={700}
                            />
                            <Tooltip id={`ak-activity-completed-${props.activity.id}`}
                                     className="z-10 !rounded-sm !bg-indigo-900 !text-accent-foreground">
                                <>
                                    <p>Completed: {props.activity.completionDate ? format(props.activity.completionDate, 'PPP') : "???"}</p>
                                </>
                            </Tooltip>
                        </>
                    ) : (
                        <CircleIcon className="text-muted-foreground"/>
                    )}
                </div>
                <div
                    className={cn("cursor-pointer flex items-center gap-2 flex-row w-full rounded-sm px-1 py-1 ak-module-activity-row",
                        selectedActivity?.id === props.activity.id ? "bg-gray-700" : "hover:bg-gray-800")}
                     onClick={() => setSelectedActivity(props.activity)}
                >
                    <div>
                        <ActivityTypeIcon type={props.activity.type} className="size-4" />
                    </div>
                    <div className="font-semibold">
                        {props.activity.name}
                    </div>
                    {!props.activity.isCompleted && (
                        <div>
                            <Badge variant="secondary" className="text-[9px] py-[1px] mx-0.5">
                                <HourglassIcon className="!size-2.5" /> {formatDuration(props.activity.duration)}
                            </Badge>
                        </div>
                    )}
                    {/*<div className="ak-module-activity-row-actions flex-row gap-0.5">*/}
                    {/*    <div>*/}
                    {/*        <Tooltip id="ak-activity-delete" className="z-10 !rounded-sm">*/}
                    {/*            <p>Delete activity</p>*/}
                    {/*        </Tooltip>*/}
                    {/*        <Button variant="ghost" className="text-muted-foreground px-1 py-1" size={null}*/}
                    {/*                data-tooltip-id="ak-activity-delete" data-tooltip-delay-show={700}>*/}
                    {/*            <Trash2Icon className="text-muted-foreground size-3.5"/>*/}
                    {/*        </Button>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>
        </>
    );
}
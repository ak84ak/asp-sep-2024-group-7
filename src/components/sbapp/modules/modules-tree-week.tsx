import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {
    ChevronDownIcon,
    ChevronRightIcon,
    CircleCheckBigIcon, CircleHelpIcon,
    CircleIcon,
    CirclePlusIcon,
    DotIcon, HourglassIcon,
    ImportIcon
} from "lucide-react";
import {Badge} from "@/components/ui/badge";

import './modules-tree-week.css';
import {Tooltip} from 'react-tooltip'
import ModulesTreeActivity from "@/components/sbapp/modules/modules-tree-activity";
import {formatDuration} from "@/lib/ui-utils";
import {ICourseModule, ICourseModuleActivity} from "@/models/domain/ModulesModels";

export type ModulesTreeWeekProperties = {
    week: number;
    module: ICourseModule;
    isExpanded?: boolean;
    onManualAdd?: (week: number) => void;
    onImport?: (week: number) => void;
}

export default function ModulesTreeWeek(props: ModulesTreeWeekProperties) {
    const [isExpanded, setIsExpanded] = useState(props.isExpanded || false);
    const [activities, setActivities] = useState<ICourseModuleActivity[]>([]);

    const [notCompletedActivities, setNotCompletedActivities] = useState<number>(0);
    const [durationLeft, setDurationLeft] = useState<number>(0);

    useEffect(() => {
        let weekActivities = props.module.activities.filter((a) => a.week === props.week);
        weekActivities = weekActivities.sort((a, b) => a.order - b.order);
        setActivities(weekActivities);
        setNotCompletedActivities(weekActivities.reduce((cnt, a) => cnt + (!a.isCompleted ? 1 : 0), 0));
        setDurationLeft(weekActivities.reduce(((duration, a) => duration + (a.isCompleted ? 0 : a.duration)), 0));
    }, [props.module, props.week]);

    const onManualAdd = () => {
        if (props.onManualAdd) {
            props.onManualAdd(props.week);
        }
    }

    const onImportClick = () => {
        if (props.onImport) {
            props.onImport(props.week);
        }
    }

    return (
        <>
            <div className="w-full flex flex-row gap-2 text-lg items-center rounded-lg pr-1">
                <div className="m-0 p-0 gap-0">
                    <Button variant="outline" size={null} className="p-1 bg-transparent border-0"
                            onClick={() => setIsExpanded(!isExpanded)}
                            disabled={activities.length === 0}
                    >
                        {activities.length > 0 ? (
                            <>
                                {isExpanded ? <ChevronDownIcon size={15}/> : <ChevronRightIcon size={15}/>}
                            </>
                        ) : (
                            <DotIcon size={15}/>
                        )}
                    </Button>
                </div>
                <div>
                    {activities.length > 0 ? (
                        <>
                            {!activities.every(a => a.isCompleted) && (
                                <Tooltip id="ak-week-not-finished" className="z-10 !rounded-sm">
                                    <>
                                        <p>Not completed yet.</p>
                                        <p>The week can be completed only when all activities are completed</p>
                                    </>
                                </Tooltip>
                            )}
                            {activities.every(a => a.isCompleted) ? (
                                <CircleCheckBigIcon className="stroke-green-500"/>
                            ) : (
                                <CircleIcon className="text-muted-foreground"
                                            data-tooltip-id="ak-week-not-finished"
                                            data-tooltip-delay-show={700}/>
                            )}
                        </>
                    ) : (
                        <>
                            <Tooltip id="ak-week-no-activities" className="z-10 !rounded-sm">
                                <p>This week has no activities yet.</p>
                            </Tooltip>
                            <CircleHelpIcon className="text-muted-foreground"
                                            data-tooltip-id="ak-week-no-activities"
                                            data-tooltip-delay-show={700}/>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-row w-full rounded-sm px-1 py-1 ak-module-week-row">
                    <div className="font-semibold">
                        Week #{props.week}
                    </div>
                    <div className="flex items-start self-start">
                        {notCompletedActivities > 0 && (
                            <Badge variant="secondary" className="text-[9px] py-[1px] mx-0.5">
                                {notCompletedActivities === 1 ? "1 activity left" : `${activities.length} activities left`}
                            </Badge>
                        )}
                        { durationLeft > 0 && (
                            <Badge variant="secondary" className="text-[9px] py-[1px] mx-0.5">
                                <HourglassIcon className="!size-2.5" /> {formatDuration(durationLeft)}
                            </Badge>
                        )}
                    </div>
                    <div className="ak-module-week-row-actions flex-row gap-0.5">
                        <div>
                            <Tooltip id="ak-week-import" className="z-10 !rounded-sm"><p>Import from Coursera</p>
                            </Tooltip>
                            <Button variant="ghost" className="text-muted-foreground px-1 py-1" size={null}
                                    data-tooltip-id="ak-week-import" data-tooltip-delay-show={700}
                                    onClick={onImportClick}
                            >
                                <ImportIcon size={15} className="text-muted-foreground"/>
                            </Button>
                        </div>
                        <div>
                            <Tooltip id="ak-week-add" className="z-10 !rounded-sm"><p>Add manually</p></Tooltip>
                            <Button variant="ghost" className="text-muted-foreground px-1 py-1" size={null}
                                    data-tooltip-id="ak-week-add" data-tooltip-delay-show={700}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onManualAdd();
                                    }}
                            >
                                <CirclePlusIcon size={15} className="text-muted-foreground"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="flex flex-col gap-2 ml-12">
                    {activities.map((activity) => (
                        <ModulesTreeActivity key={activity.id}
                                             module={props.module}
                                             week={props.week}
                                             activity={activity}
                        />
                    ))}
                </div>
            )}
        </>);
}
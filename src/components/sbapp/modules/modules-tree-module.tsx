import {ICourseModule} from "@/models/api/ModulesModels";
import {
    ChevronDownIcon,
    ChevronRightIcon,
    CircleCheckBigIcon,
    CircleIcon,
    ImportIcon,
    LightbulbIcon
} from "lucide-react";
import {cn} from "@/lib/utils";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import ModulesTreeWeek from "@/components/sbapp/modules/modules-tree-week";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Tooltip} from "react-tooltip";
import {useSBStore} from "@/providers/sb-store-provider";

export type ModulesTreeItemProperties = {
    module: ICourseModule;
    isExpanded?: boolean;
    onAddActivityManual?: (moduleId: string, week: number) => void;
    onImport?: (moduleId: string, week: number) => void;
}

export default function ModulesTreeModule(props: ModulesTreeItemProperties) {
    const selectedModule = useSBStore((store) => store.modulesPageSelectedModule);
    const setSelectedModule = useSBStore((store) => store.setModulesPageSelectedModule);

    const [isExpanded, setIsExpanded] = useState(props.isExpanded || false);
    const [totalWeeks, setTotalWeeks] = useState(props.module.totalWeeks);

    const onAddActivityManual = (week: number) => {
        if (props.onAddActivityManual) {
            props.onAddActivityManual(props.module.id, week);
        }
    }

    const onImport = (week: number) => {
        if (props.onImport) {
            props.onImport(props.module.id, week);
        }
    }

    useEffect(() => {
        let maxWeek = props.module.totalWeeks;
        props.module.activities.forEach((a) => {
            if (a.week > maxWeek) {
                maxWeek = a.week;
            }
        });
        setTotalWeeks(maxWeek);

    }, [props.module]);

    return (
        <>
            <div className="w-full flex flex-row gap-2 text-lg items-center rounded-lg pr-1">
                <div className="m-0 p-0 gap-0">
                    <Button variant="outline" size={null} className="p-1 bg-transparent border-0"
                            onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <ChevronDownIcon size={15}/> : <ChevronRightIcon size={15}/>}
                    </Button>
                </div>
                <div>
                    <Tooltip id="ak-module-is-finished" className="z-10 !rounded-sm">
                        {props.module.isCompleted ? (
                            // TODO
                            <p>Completed: [DATE]</p>
                        ) : (
                            <>
                                <p>Not completed yet.</p>
                                <p>The Module can be completed only when all activities are completed</p>
                            </>
                        )}
                    </Tooltip>
                    {props.module.isCompleted ? (
                        <CircleCheckBigIcon className="stroke-green-500"
                                            data-tooltip-id="ak-module-is-finished"
                                            data-tooltip-delay-show={700}/>
                    ) : (
                        <CircleIcon className="text-muted-foreground"
                                    data-tooltip-id="ak-module-is-finished"
                                    data-tooltip-delay-show={700}/>
                    )}
                </div>
                <div
                    className={cn("cursor-pointer flex items-center gap-2 flex-row w-full rounded-sm px-1 py-1",
                        selectedModule?.id === props.module.id ? "bg-gray-700" : "hover:bg-gray-800")}
                    onClick={() => setSelectedModule(props.module)}
                >
                    <div className="font-semibold">
                        {props.module.code}
                    </div>
                    <div>
                        {props.module.name}
                    </div>
                </div>
            </div>
            {isExpanded && (
                <>
                    {props.module.activities.length === 0 && (
                        <div className="flex flex-col gap-2 ml-4">
                            <Alert>
                                <LightbulbIcon/>
                                <AlertTitle>
                                    Hint
                                </AlertTitle>
                                <AlertDescription>
                                    <p>It looks like there are no activities for this module yet.</p>
                                    <p>You can easily import activities week by week from Coursera. Just hover the
                                        necessary week and click the import icon: <ImportIcon className="inline"
                                                                                              size={15}/></p>
                                    <p>Or create them manually.</p>
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                    <div className="flex flex-col gap-2 ml-4">
                        {Array.from({length: totalWeeks}, (_, i) => i + 1).map((week) => (
                            <ModulesTreeWeek key={week}
                                             week={week}
                                             module={props.module}
                                             onManualAdd={onAddActivityManual}
                                             onImport={onImport}
                            />
                        ))}
                    </div>
                </>
            )}
        </>
    )

}
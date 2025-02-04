import Image from 'next/image';

import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Fragment, MouseEventHandler, useState} from "react";
import CourseraImportTextarea from "@/components/sbapp/modules/coursera-import-textarea";
import {ICourseraMappedActivity, ICourseraParsedActivity} from "@/models/parsing/CourseraModels";
import {cn} from "@/lib/utils";
import AKStyledCheckBox from "@/components/ui-ak/AKStyledCheckBox";
import {CalendarIcon, CircleCheckBigIcon, CircleIcon} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar";
import AKCombobox, {IAKComboboxOption} from "@/components/ui-ak/AKCombobox";
import {getActivityTypeComboBoxOptions} from "@/lib/constants/activity-type-combobox-options";
import {ModuleActivityType} from "@/models/shared/ModuleActivityType";
import {Input} from "@/components/ui/input";
import {Tooltip} from "react-tooltip";
import {useSBStore} from "@/providers/sb-store-provider";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {ICourseModule} from "@/models/domain/ModulesModels";

// TODO: Move this to config
const defaultModuleStartDate = new Date(2024, 9, 14, 12, 0, 0, 0);

export type CourseraImportDialogProperties = {
    week: number;
    module: ICourseModule;
    onClose: () => void;
}

export default function CourseraImportDialog(props: CourseraImportDialogProperties) {
    const apiImportCourseraActivities = useSBStore((store) => store.apiImportCourseraActivities);

    const [isParsingStage, setIsParsingStage] = useState(true);
    const [isResultsStage, setIsResultsStage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [error, setError] = useState<string>("");

    const [weekStartDate, setWeekStartDate] = useState<Date>(props.module.startDate
        ? new Date(props.module.startDate.getTime() + 7 * 24 * 60 * 60 * 1000 * (props.week - 1))
        : new Date(defaultModuleStartDate));

    const [howToExpanded, setHowToExpanded] = useState(false);

    const [activityTypesOptions] = useState<IAKComboboxOption[]>(getActivityTypeComboBoxOptions());

    const [, setParsedCourseraActivities] = useState<ICourseraParsedActivity[]>([]);
    const [mappedCourseraActivities, setMappedCourseraActivities] = useState<ICourseraMappedActivity[]>([]);

    const [parsingErrors, setParsingErrors] = useState<string[]>([]);

    const onOpenChange = (isOpen: boolean) => {
        if (isLoading) {
            return;
        }

        if (!isOpen) {
            props.onClose();
        }
    }

    const onImport = async () => {
        setError("");
        setIsConfirmationOpen(true);
    }

    const onConfirmationClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
        e.preventDefault();

        setIsConfirmationOpen(false);
        try {
            setIsLoading(true);
            const res = await apiImportCourseraActivities(props.module.id, props.week, mappedCourseraActivities);
            if (res) {
                if (props.onClose) {
                    props.onClose();
                }
            }
        } catch (e) {
            setError((e as { message: string }).message ?? "An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    const mapActivities = (parsedActivities: ICourseraParsedActivity[]): ICourseraMappedActivity[] => {
        return parsedActivities.map((a) => {
            let type: ModuleActivityType = "other";

            let typeParsed = true;
            switch (a.type) {
                case "graded practice assignment":
                case "practice assignment":
                    type = "practice";
                    break;
                case "practice peer-graded assignment":
                    type = "peer-assignment";
                    break;
                case "practice quiz":
                case "graded quiz":
                    type = "quiz";
                    break;
                case "discussion prompt":
                    type = "discussion";
                    break;
                case "lab":
                    type = "lab";
                    break;
                case "reading":
                    type = "reading";
                    break;
                case "video":
                    type = "video";
                    break;
                default:
                    type = "other";
                    typeParsed = a.type === undefined;
                    setParsingErrors((prev) => [...prev, `Unknown activity type: ${a.type}`]);
                    break;
            }

            let deadline: Date | undefined = undefined;
            try {
                deadline = a.deadline ? new Date(a.deadline) : undefined;
            } catch {
                setParsingErrors((prev) => [...prev, `Could not parse deadline for activity: ${a.name} - ${a.deadline}`]);
                deadline = undefined;
            }

            let durationNotParsed = false;
            let duration = 60;
            if (!a.duration || a.duration <= 0) {
                durationNotParsed = true;
            } else {
                duration = a.duration
            }

            return {
                name: a.name,
                type: type,
                originalType: a.type,
                typeParsed,
                duration: duration,
                durationNotParsed: durationNotParsed,
                isCompleted: a.completed || false,
                completionDate: a.completed ? weekStartDate : undefined,
                deadline: deadline
            }
        });
    }

    const onParse = (activities: ICourseraParsedActivity[], errors: string[]) => {
        setIsParsingStage(false);

        setParsedCourseraActivities(activities);
        setParsingErrors(errors);

        if (activities && activities.length > 0) {
            setMappedCourseraActivities(mapActivities(activities))
        } else {
            setMappedCourseraActivities([]);
        }

        setIsResultsStage(true);
    }

    return (
        <>
            {isParsingStage && (
                <Dialog open={true} defaultOpen={true} onOpenChange={onOpenChange}>
                    <DialogContent className="md:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogTitle>
                            Activities Import from Coursera for Week #{props.week}
                        </DialogTitle>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <h1 className="font-semibold text-lg my-3 text-center">Settings</h1>
                                <div className="flex flex-row gap-2 items-center justify-center mb-8">
                                    <div>Week start date:</div>
                                    <div>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[220px] justify-start text-left font-normal ml-2",
                                                        !weekStartDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                                    {weekStartDate ? format(weekStartDate, "PPP") :
                                                        <span>Pick the completion date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={weekStartDate}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            setWeekStartDate(date);
                                                        }
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <h1 className="font-semibold text-lg my-3 text-center">Quick help</h1>
                                <p className="text-start my-2">To import the week curriculum from the Coursera website,
                                    just
                                    copy and paste
                                    the whole page (or one week&apos;s content only) from the Coursera website into the
                                    text
                                    area below.</p>
                                <ul className="list-disc ml-5">
                                    <li>Select all - Ctrl+A</li>
                                    <li>Copy - Ctrl+C or right click - Copy</li>
                                    <li>Paste here - Ctrl+V or right-click - Paste</li>
                                </ul>
                                <div className="text-center">
                                    <Button variant="link"
                                            className="underline underline-offset-4 decoration-dashed"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setHowToExpanded(!howToExpanded);
                                            }}>
                                        Click here to see a short &quot;how-to&quot; GIF animation
                                    </Button>
                                </div>
                                {howToExpanded && (
                                    <Image src="/sb-coursera-import-tutorial.gif" width={0} height={0}
                                           className="w-full"
                                           alt="How to import"/>
                                )}
                                <p className="my-2">
                                    The parser will try to extract all activities and their details from the raw HTML.
                                </p>
                                <p className="my-2">
                                    <b>The text area will remain empty</b> (this is expected behaviour) when you paste
                                    the
                                    content, but the parser will start automatically.
                                </p>
                                <p className="my-2">
                                    Don&apos;t worry, the parsing is happening on your device only, no data is sent to
                                    our
                                    servers (check it in devtools if you want).
                                </p>
                                <p className="my-2">
                                    Review the parsed result and click the &quot;Import&quot; button to
                                    add the to the selected Week {props.week}.
                                </p>
                                <p className="my-2">
                                    Please let us know if you encounter any issues with the parser. We are constantly
                                    improving it. Thank you!
                                </p>
                                <h1 className="font-semibold text-lg my-3 text-center">Paste raw page content
                                    below:</h1>
                                <CourseraImportTextarea onParse={onParse}/>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            {isResultsStage && (
                <>
                    <Dialog open={true} defaultOpen={true} onOpenChange={onOpenChange}>
                        <DialogContent className={cn("max-h-[90vh] overflow-y-auto",
                            mappedCourseraActivities && mappedCourseraActivities.length > 0 ? "sm:max-w-[90vw]" : null)}>
                            <DialogTitle>
                                Import Results
                            </DialogTitle>
                            <div className="flex flex-row gap-2 items-center justify-center mb-8">
                                <div className="text-center">
                                    Please review the parsed activities and make any necessary adjustments.<br/>
                                    You can mark the activities as completed, set the deadline, and adjust the duration.<br/>
                                    Click on &quot;Import&quot; button to add the activities to the selected
                                    Week {props.week}.
                                </div>
                            </div>
                            {mappedCourseraActivities && mappedCourseraActivities.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {error && <div className="text-red-500 text-sm">{error}</div>}
                                    <div className="flex flex-row gap-2 items-center justify-center mt-8">
                                        <Button variant="default" size="lg"
                                                className="bg-indigo-800 text-foreground hover:bg-indigo-900 hover:text-foreground"
                                                disabled={isLoading}
                                                onClick={onImport}
                                        >
                                            Import
                                        </Button>
                                    </div>
                                    <div
                                        className="grid grid-cols-[max-content_auto_auto_auto_auto_auto] gap-2">
                                        <div className="font-semibold text-center my-2 border-b">#</div>
                                        <div className="font-semibold text-center my-2 border-b">Completed</div>
                                        <div className="font-semibold text-center my-2 border-b">Type</div>
                                        <div className="font-semibold text-center my-2 border-b">Name</div>
                                        <div className="font-semibold text-center my-2 border-b">Duration (m)</div>
                                        <div className="font-semibold text-center my-2 border-b">Deadline</div>

                                        {mappedCourseraActivities.map((a, idx) => (
                                            <Fragment key={idx}>
                                                <div
                                                    className="flex flex-row items-center justify-center gap-2">{idx + 1}</div>
                                                <div className="flex flex-row items-center justify-center gap-2">
                                                    <AKStyledCheckBox id={`is-completed-${idx}`}
                                                                      name={`is-completed-${idx}`}
                                                                      checked={a.isCompleted}
                                                                      checkedIcon={<CircleCheckBigIcon
                                                                          className="stroke-green-500 size-5"/>}
                                                                      uncheckedIcon={<CircleIcon
                                                                          className="text-muted-foreground size-5"/>}
                                                                      onCheckChange={(checked) => {
                                                                          setMappedCourseraActivities((prev) => {
                                                                              const newActivities = [...prev];
                                                                              newActivities[idx].isCompleted = checked;
                                                                              return newActivities;
                                                                          })
                                                                      }}
                                                    />
                                                    {a.isCompleted && (
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-[180px] justify-start text-left font-normal ml-2",
                                                                        !a.completionDate && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4"/>
                                                                    {a.completionDate ? format(a.completionDate, "PPP") :
                                                                        <span>Pick the completion date</span>}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={a.completionDate}
                                                                    onSelect={(date) => {
                                                                        setMappedCourseraActivities((prev) => {
                                                                            const newActivities = [...prev];
                                                                            newActivities[idx].completionDate = date;
                                                                            return newActivities;
                                                                        })
                                                                    }}
                                                                    disabled={(date) => date > new Date()}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    )}
                                                </div>
                                                <div className="flex flex-col justify-center items-center gap-2">
                                                    <AKCombobox className="w-[190px]"
                                                                options={activityTypesOptions}
                                                                emptyText="Select activity type..."
                                                                value={a.type
                                                                    ? (activityTypesOptions.find(o => o.id === a.type)
                                                                        || activityTypesOptions.find(o => o.id === "other")) : undefined}
                                                                onChange={(v) => {
                                                                    const value = v?.id;
                                                                    setMappedCourseraActivities((prev) => {
                                                                        const newActivities = [...prev];
                                                                        newActivities[idx].type = (value ?? "other") as ModuleActivityType;
                                                                        return newActivities;
                                                                    })
                                                                }}
                                                    />
                                                    {!a.typeParsed && (
                                                        <div className="text-xs text-muted-foreground">
                                                            Original type: {a.originalType}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-row items-center justify-center">
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        value={a.name}
                                                        onChange={(e) => {
                                                            setMappedCourseraActivities((prev) => {
                                                                const newActivities = [...prev];
                                                                newActivities[idx].name = e.target.value;
                                                                return newActivities;
                                                            })
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-row items-center justify-center">
                                                    {a.durationNotParsed && (
                                                        <Tooltip id={`duration-not-parsed-${idx}`}
                                                                 className="z-10 !rounded-sm">
                                                            The duration was not parsed correctly.<br/>
                                                            60 minutes will be used as a default value.
                                                        </Tooltip>
                                                    )}
                                                    <Input
                                                        className={cn("max-w-20", a.durationNotParsed && "border-orange-500")}
                                                        data-tooltip-id={a.durationNotParsed ? `duration-not-parsed-${idx}` : undefined}
                                                        type="number"
                                                        min={1}
                                                        max={7 * 60}
                                                        required
                                                        value={a.duration}
                                                        onChange={(e) => {
                                                            setMappedCourseraActivities((prev) => {
                                                                const newActivities = [...prev];
                                                                newActivities[idx].duration = parseInt(e.target.value);
                                                                return newActivities;
                                                            })
                                                        }}
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-[180px] justify-start text-left font-normal ml-2",
                                                                    !a.deadline && "text-muted-foreground"
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                                                {a.deadline ? format(a.deadline, "PPP") :
                                                                    <span>Pick the deadline</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                mode="single"
                                                                selected={a.deadline}
                                                                onSelect={(date) => {
                                                                    setMappedCourseraActivities((prev) => {
                                                                        const newActivities = [...prev];
                                                                        newActivities[idx].deadline = date;
                                                                        return newActivities;
                                                                    })
                                                                }}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </Fragment>
                                        ))}
                                    </div>
                                    <div className="flex flex-row gap-2 items-center justify-center mt-4">
                                        <Button variant="default" size="lg"
                                                className="bg-indigo-800 text-foreground hover:bg-indigo-900 hover:text-foreground"
                                                disabled={isLoading}
                                                onClick={onImport}
                                        >
                                            Import
                                        </Button>
                                    </div>
                                    <div>
                                        {parsingErrors && parsingErrors.length > 0 && (
                                            <>
                                                <h1 className="font-semibold text-lg my-3 text-center">Parsing
                                                    errors</h1>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {Array.from(new Set(parsingErrors)).map((e, idx) => (
                                                        <div key={idx}>
                                                            {e}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="text-center">
                                        <h1 className="font-semibold text-lg my-3">No activities found <span
                                            className="ml-3 text-2xl">:(</span></h1>
                                        <p className="my-2">The parser did not find any activities in the content you
                                            provided.</p>
                                        <p className="my-2">If you&apos;re sure you did everything correctly, feel free
                                            to
                                            contact us
                                            and we will do our best to fix the parser as soon as possible.</p>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                    <AlertDialog open={isConfirmationOpen} onOpenChange={() => setIsConfirmationOpen(false)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Import Confirmation</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to import all the activities?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                                <AlertDialogAction disabled={isLoading} onClick={onConfirmationClick}>Yes</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </>
    );
}
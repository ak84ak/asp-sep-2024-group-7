import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog";
import {useSBStore} from "@/providers/sb-store-provider";
import {MouseEventHandler, useEffect, useState} from "react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import AKStyledCheckBox from "@/components/ui-ak/AKStyledCheckBox";
import {
    CalendarIcon,
    CircleCheckBigIcon,
    CircleIcon,
} from "lucide-react";
import {Slider} from "@/components/ui/slider";
import {formatDuration} from "@/lib/ui-utils";
import AKCombobox, {IAKComboboxOption} from "@/components/ui-ak/AKCombobox";
import {Button} from "@/components/ui/button";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {mapModuleActivityType} from "@/models/shared/ModuleActivityType";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar";
import {getActivityTypeComboBoxOptions} from "@/lib/constants/activity-type-combobox-options";
import {ICourseModule} from "@/models/domain/ModulesModels";

export type AddActivityManualProperties = {
    week: number;
    moduleId: string;
    onClose: () => void;
    onAddSuccess?: () => void;
}

export default function AddActivityManual(props: AddActivityManualProperties) {
    const apiCreateActivity = useSBStore((store) => store.apiCreateActivity);
    const modules = useSBStore((store) => store.modules);

    const [currentModule, setCurrentModule] = useState<ICourseModule | undefined>(undefined);
    const [name, setName] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const [completionDate, setCompletionDate] = useState<Date | undefined>()
    const [duration, setDuration] = useState(60);
    const [activityType, setActivityType] = useState<string | undefined>(undefined);
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [activityTypesOptions, setActivityTypesOptions] = useState<IAKComboboxOption[]>(getActivityTypeComboBoxOptions());

    useEffect(() => {
        if (modules && modules.length > 0) {
            const fm = modules.find(m => m.id === props.moduleId);
            if (fm) {
                setCurrentModule(fm);
            }
        }
    }, [modules, props.moduleId]);

    const onOpenChange = (open: boolean) => {
        if (!open) {
            props.onClose();
        }
    }

    const validateForm = () => {
        if (name.trim() === "") {
            setError("Activity name cannot be empty");
            return false;
        }

        if (name.trim().length < 3) {
            setError("Activity name must be at least 3 characters long");
            return false;
        }

        if (!activityType) {
            setError("Please select an activity type");
            return false;
        }

        if (activityType.trim() === "") {
            setError("Activity type cannot be empty");
            return false;
        }

        if (isCompleted && !completionDate) {
            setError("Please select the completion date");
            return false;
        }

        return true;
    }

    const onAddClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
        e.preventDefault();

        setError("");
        if (!validateForm()) {
            return;
        }

        setIsConfirmationOpen(true);
    }

    const onConfirmationClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
        e.preventDefault();

        setIsConfirmationOpen(false);
        try {
            setLoading(true);
            const res = await apiCreateActivity(
                props.moduleId,
                props.week,
                name.trim(),
                isCompleted,
                completionDate,
                duration,
                mapModuleActivityType(activityType!),
                // TODO: Add deadline
                undefined);
            if (res) {
                if (props.onAddSuccess) {
                    props.onAddSuccess();
                }
            }
        } catch (e) {
            setError((e as { message: string }).message ?? "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Dialog open={true} onOpenChange={onOpenChange} defaultOpen={true}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogTitle>
                        Add Activity
                    </DialogTitle>
                    <form>
                        <div className="flex flex-col gap-6 mt-4">
                            <div className="inline-grid grid-cols-[max-content_auto] gap-2">
                                <div>
                                    <span className="font-semibold">Module:</span>
                                </div>
                                <div>
                                    {currentModule?.name}
                                </div>
                                <div>
                                    <span className="font-semibold">Week:</span>
                                </div>
                                <div>
                                    {props.week}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <AKStyledCheckBox id="add-activity-completed" name="add-activity-completed"
                                                  checkedIcon={<CircleCheckBigIcon
                                                      className="text-green-500 bg-transparent size-6"/>}
                                                  uncheckedIcon={<CircleIcon
                                                      className="text-foreground bg-transparent size-6"/>}
                                                  checked={isCompleted}
                                                  onCheckChange={(value) => setIsCompleted(value)}
                                />
                                <label
                                    htmlFor="add-activity-completed"
                                    className="text-base cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Is completed
                                </label>
                                {isCompleted && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[220px] justify-start text-left font-normal ml-2",
                                                    !completionDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {completionDate ? format(completionDate, "PPP") : <span>Pick the completion date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={completionDate}
                                                onSelect={setCompletionDate}
                                                disabled={(date) => date > new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Activity Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Module introduction"
                                    required
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setError("");
                                    }}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Activity Type</Label>
                                <AKCombobox options={activityTypesOptions}
                                            emptyText="Select activity type..."
                                            value={activityType
                                                ? (activityTypesOptions.find(o => o.id === activityType)
                                                    || activityTypesOptions.find(o => o.id === "other")) : undefined}
                                            onChange={(v) => {
                                                setActivityType(v?.id);
                                            }}
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="grid grid-cols-[max-content_max-content_auto] gap-2">
                                    <Label htmlFor="add-activity-duration">Duration (minutes):</Label>
                                    <Input
                                        className="max-w-30"
                                        id="add-activity-duration"
                                        type="number"
                                        placeholder="60"
                                        min={1}
                                        max={7 * 60}
                                        required
                                        value={duration}
                                        onChange={(e) => {
                                            setDuration(parseInt(e.target.value));
                                        }}
                                    />
                                    <div className="flex items-center justify-start ml-3">
                                        {formatDuration(duration)}
                                    </div>
                                </div>
                                <Slider className="my-2"
                                        id="add-activity-duration-slider"
                                        name="duration"
                                        defaultValue={[60]} min={1} max={7 * 60} step={1} value={[duration]}
                                        onValueChange={(v) => {
                                            setDuration(v[0])
                                        }}/>
                            </div>

                            {error && <div className="text-red-500 text-sm">{error}</div>}
                            <Button type="submit" className="w-full cursor-pointer" variant="outline"
                                    onClick={onAddClick}
                                    disabled={loading}>
                                Add Module Activity
                            </Button>

                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            <AlertDialog open={isConfirmationOpen} onOpenChange={() => setIsConfirmationOpen(false)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmation</AlertDialogTitle>
                        <AlertDialogDescription>
                            This is just a confirmation that you&apos;ve entered correct details.<br />
                            Are you sure you want to add this activity module?<br/>
                            <br/>
                            <strong>Module:</strong> {currentModule?.name}<br/>
                            <strong>Week:</strong> {props.week}<br/>
                            <strong>Name:</strong> {name}<br/>
                            <strong>Completed:</strong> {isCompleted ? "Yes" : "No"}<br/>
                            {isCompleted && completionDate && <><strong>Completion Date:</strong> {format(completionDate!, "PPP")}<br/></>}
                            <strong>Duration:</strong> {formatDuration(duration)}<br/>
                            <strong>Type:</strong> {activityTypesOptions.find(o => o.id === activityType)?.title}<br/>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={loading} onClick={onConfirmationClick}>Yes</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
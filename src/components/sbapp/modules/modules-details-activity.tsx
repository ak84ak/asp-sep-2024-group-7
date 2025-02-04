import {useSBStore} from "@/providers/sb-store-provider";
import {CalendarIcon, CircleAlertIcon, CircleCheckBigIcon, CircleIcon, Trash2Icon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Slider} from "@/components/ui/slider";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {MouseEventHandler, useEffect, useState} from "react";
import {cn} from "@/lib/utils";
import AKStyledCheckBox from "@/components/ui-ak/AKStyledCheckBox";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar";
import AKCombobox, {IAKComboboxOption} from "@/components/ui-ak/AKCombobox";
import {formatDuration} from "@/lib/ui-utils";
import {getActivityTypeComboBoxOptions} from "@/lib/constants/activity-type-combobox-options";
import {toast} from "sonner";
import {mapModuleActivityType} from "@/models/shared/ModuleActivityType";
import {ICourseModuleActivity} from "@/models/domain/ModulesModels";

export default function ModulesDetailsActivity() {
    const modules = useSBStore((store) => store.modules);
    const selectedActivity = useSBStore((store) => store.modulesPageSelectedActivity);
    const apiUpdateActivity = useSBStore((store) => store.apiUpdateActivity);
    const apiDeleteActivity = useSBStore((store) => store.apiDeleteActivity);

    const [name, setName] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const [completionDate, setCompletionDate] = useState<Date | undefined>(undefined);
    const [activityType, setActivityType] = useState<string | undefined>(undefined);
    const [duration, setDuration] = useState(60);
    const [order, setOrder] = useState(0);

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [isSave, setIsSave] = useState(false);

    const [hasChanges, setHasChanges] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [activityTypesOptions, setActivityTypesOptions] = useState<IAKComboboxOption[]>(getActivityTypeComboBoxOptions());

    useEffect(() => {
        if (!selectedActivity) {
            setName("");
            setIsCompleted(false);
            setCompletionDate(undefined);
            setActivityType(undefined);
            setDuration(60);
            setOrder(0);
            return;
        }

        setName(selectedActivity.name);
        setIsCompleted(selectedActivity.isCompleted);
        setCompletionDate(selectedActivity.completionDate);
        setActivityType(selectedActivity.type);
        setDuration(selectedActivity.duration);
        setOrder(selectedActivity.order);

    }, [selectedActivity])

    useEffect(() => {
        if (!selectedActivity) {
            setHasChanges(false);
            return;
        }

        setHasChanges(
            name !== selectedActivity.name ||
            isCompleted !== selectedActivity.isCompleted ||
            completionDate !== selectedActivity.completionDate ||
            activityType !== selectedActivity.type ||
            duration !== selectedActivity.duration ||
            order !== selectedActivity.order
        );
    }, [selectedActivity, name, isCompleted, completionDate, activityType, duration, order]);

    if (!selectedActivity) {
        return null;
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

        if (order < 1) {
            setError("Order must be greater than 0");
            return false;
        }

        return true;
    }

    const onSaveClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
        e.preventDefault();

        setError("");
        if (!validateForm()) {
            return;
        }

        setIsSave(true);
        setIsConfirmationOpen(true);
    }

    const onDeleteClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
        e.preventDefault();
        setIsSave(false);
        setIsConfirmationOpen(true);
    }

    const onConfirmationClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
        e.preventDefault();

        if (!modules) {
            throw new Error("Modules not loaded");
        }

        setIsConfirmationOpen(false);
        try {
            setLoading(true);
            const moduleId = modules.find(m => m.activities.find((a: ICourseModuleActivity) => a.id === selectedActivity.id))?.id;

            if (!moduleId) {
                throw new Error("Module not found");
            }

            if (isSave) {
                const updateRequest = {
                    isNameUpdated: name !== selectedActivity.name,
                    newName: name,
                    isCompletedUpdated: isCompleted !== selectedActivity.isCompleted,
                    newIsCompleted: isCompleted,
                    isCompletionDateUpdated: completionDate !== selectedActivity.completionDate,
                    newCompletionDate: completionDate,
                    isDurationUpdated: duration !== selectedActivity.duration,
                    newDuration: duration,
                    isTypeUpdated: activityType !== selectedActivity.type,
                    newType: activityType !== selectedActivity.type ? mapModuleActivityType(activityType!) : undefined,
                    isOrderUpdated: order !== selectedActivity.order,
                    newOrder: order,
                    // TODO: Add deadline update
                    isDeadlineUpdated: false,
                    newDeadline: undefined
                }
                await apiUpdateActivity(moduleId, selectedActivity.id, updateRequest);
                toast.success("Activity updated");
            } else {
                await apiDeleteActivity(moduleId, selectedActivity.id);
                toast.success("Activity deleted");
            }
        } catch (e) {
            setError((e as { message: string }).message ?? "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full flex flex-col gap-1 mx-2">
            <div className="w-full bg-zinc-800 text-lg">
                Activity details
            </div>
            <form>
                <div className="flex flex-col gap-4 mt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="id">Id</Label>
                        <Input
                            id="id"
                            type="text"
                            value={selectedActivity.id}
                            disabled
                        />
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
                                        <CalendarIcon className="mr-2 h-4 w-4"/>
                                        {completionDate ? format(completionDate, "PPP") :
                                            <span>Pick the completion date</span>}
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
                    <div className="grid gap-2">
                        <Label htmlFor="order"
                               className={order !== selectedActivity.order ? "text-orange-500" : undefined}>Internal order</Label>
                        <Input
                            id="order"
                            type="number"
                            value={order}
                            min={1}
                            onChange={(e) => {
                                setOrder(parseInt(e.target.value));
                                setError("");
                            }}
                        />
                    </div>

                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <Button type="submit" className={cn("w-full cursor-pointer", hasChanges ? "text-orange-500" : null)}
                            variant="outline"
                            onClick={onSaveClick}
                            disabled={loading || !hasChanges}>
                        <CircleAlertIcon/> Save
                    </Button>
                    <div
                        className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                          <span className="relative z-10 bg-background px-2 text-muted-foreground">
                            Danger zone
                          </span>
                    </div>
                    <Button type="submit" className="w-full cursor-pointer" variant="destructive"
                            onClick={onDeleteClick}
                            disabled={loading}>
                        <Trash2Icon/> Delete activity
                    </Button>
                </div>
            </form>
            <AlertDialog open={isConfirmationOpen} onOpenChange={() => setIsConfirmationOpen(false)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmation</AlertDialogTitle>
                        <AlertDialogDescription>
                            {isSave ? (
                                <>
                                    This is just a confirmation that you&apos;ve entered correct details.<br/>
                                    Are you sure you want to update the following details in the module?<br/>
                                    <br/>
                                    {name !== selectedActivity.name && (
                                        <><strong>Name:</strong> {name}<br/></>
                                    )}
                                    {isCompleted !== selectedActivity.isCompleted && (
                                        <><strong>Is completed:</strong> {isCompleted ? "Yes" : "No"}<br/></>
                                    )}
                                    {completionDate !== selectedActivity.completionDate && (
                                        <><strong>Completion date:</strong> {completionDate ? format(completionDate, "PPP") : "Not set"}<br/></>
                                    )}
                                    {activityType !== selectedActivity.type && (
                                        <><strong>Activity type:</strong> {activityType}<br/></>
                                    )}
                                    {duration !== selectedActivity.duration && (
                                        <><strong>Duration:</strong> {formatDuration(duration)}<br/></>
                                    )}
                                    {order !== selectedActivity.order && (
                                        <><strong>Internal order:</strong> {order}<br/></>
                                    )}
                                </>
                            ) : (
                                <>
                                    <strong className="text-red-500">WARNING!</strong><br/><br />
                                    Are you sure you want to delete this activity?<br/>
                                    This action cannot be undone and all plans and statistics associated with this activity
                                    <span className="text-red-500">will be lost.</span><br/>
                                </>
                            )}
                        </AlertDialogDescription>

                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        {isSave ? (
                            <AlertDialogAction disabled={loading} onClick={onConfirmationClick}
                                               className="cursor-pointer">
                                Save
                            </AlertDialogAction>
                        ) : (
                            <AlertDialogAction disabled={loading} onClick={onConfirmationClick}
                                               className="cursor-pointer bg-red-600 hover:bg-red-700 text-foreground hover:text-foreground"
                            >
                                Delete activity
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
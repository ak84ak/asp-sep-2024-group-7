import {useSBStore} from "@/providers/sb-store-provider";
import {CircleAlertIcon, Trash2Icon} from "lucide-react";
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
import {toast} from "sonner";
import AKDatePicker from "@/components/ui-ak/AKDatePicker";

export default function ModulesDetailsModule() {
    const selectedModule = useSBStore((store) => store.modulesPageSelectedModule);
    const apiUpdateModule = useSBStore((store) => store.apiUpdateModule);
    const apiDeleteModule = useSBStore((store) => store.apiDeleteModule);

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [weeks, setWeeks] = useState(22);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [isSave, setIsSave] = useState(false);

    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (!selectedModule) {
            setName("");
            setCode("");
            setWeeks(22);
            setStartDate(undefined);
            return;
        }

        setName(selectedModule.name);
        setCode(selectedModule.code);
        setWeeks(selectedModule.totalWeeks);
        setStartDate(selectedModule.startDate);

    }, [selectedModule]);

    useEffect(() => {
        if (!selectedModule) {
            setHasChanges(false);
            return;
        }

        setHasChanges(
            name !== selectedModule.name
            || code !== selectedModule.code
            || weeks !== selectedModule.totalWeeks
            || startDate !== selectedModule.startDate
        );
    }, [selectedModule, name, code, weeks, startDate]);

    if (!selectedModule) {
        return null;
    }

    const validateForm = () => {
        if (name.trim() === "") {
            setError("Module name cannot be empty");
            return false;
        }

        if (name.trim().length < 3) {
            setError("Module name must be at least 3 characters long");
            return false;
        }

        if (code.trim() === "") {
            setError("Module code cannot be empty");
            return false;
        }

        if (code.trim().length < 2) {
            setError("Module code must be at least 2 characters long");
            return false;
        }

        if (weeks < 1 || weeks > 52) {
            setError("Invalid number of weeks");
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

        setIsConfirmationOpen(false);
        try {
            setLoading(true);
            if (isSave) {
                const updateRequest = {
                    isNameUpdated: name !== selectedModule.name,
                    newName: name,
                    isCodeUpdated: code !== selectedModule.code,
                    newCode: code,
                    isTotalWeeksUpdated: weeks !== selectedModule.totalWeeks,
                    newTotalWeeks: weeks,
                    isStartDateUpdated: startDate !== selectedModule.startDate,
                    newStartDate: startDate
                }
                await apiUpdateModule(selectedModule.id, updateRequest);
                toast.success("Module updated");
            } else {
                await apiDeleteModule(selectedModule.id);
                toast.success("Module deleted");
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
                Module details
            </div>
            <form>
                <div className="flex flex-col gap-4 mt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="id">Id</Label>
                        <Input
                            id="id"
                            type="text"
                            value={selectedModule.id}
                            disabled
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name" className={name !== selectedModule.name ? "text-orange-500" : undefined}>Module
                            Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Introduction to Computer Science"
                            required
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="code" className={code !== selectedModule.code ? "text-orange-500" : undefined}>Module
                            Code</Label>
                        <Input
                            id="code"
                            type="text"
                            placeholder="CM2005"
                            required
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                setError("");
                            }}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="weeks"
                               className={weeks !== selectedModule.totalWeeks ? "text-orange-500" : undefined}>Total
                            weeks: {weeks}</Label>
                        <Slider className="my-2"
                                id="weeks"
                                name="weeks"
                                defaultValue={[22]} min={1} max={52} step={1} value={[weeks]}
                                onValueChange={(v) => {
                                    setWeeks(v[0])
                                }}/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="code">First week start date</Label>
                        <AKDatePicker
                            className="w-full"
                            value={startDate}
                            onChange={(date) => {
                                setStartDate(date);
                                setError("");
                            }}
                            placeholder="Pick first week start date (Monday)"
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
                        <Trash2Icon/> Delete module
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
                                    {name !== selectedModule.name && (
                                        <><strong>Name:</strong> {name}<br/></>
                                    )}
                                    {code !== selectedModule.code && (
                                        <><strong>Code:</strong> {code}<br/></>
                                    )}
                                    {weeks !== selectedModule.totalWeeks && (
                                        <><strong>Total weeks:</strong> {weeks}<br/></>
                                    )}
                                    {startDate !== selectedModule.startDate && (
                                        <><strong>Start date:</strong> {startDate?.toDateString()}<br/></>
                                    )}
                                </>
                            ) : (
                                <>
                                    <strong className="text-red-500">WARNING!</strong><br/><br />
                                    Are you sure you want to delete this module?<br/>
                                    This action cannot be undone and all activities associated with this module and all
                                    plans and statistics <span className="text-red-500">will be lost.</span><br/>
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
                                Delete module
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
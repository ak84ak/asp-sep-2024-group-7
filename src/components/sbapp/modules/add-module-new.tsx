import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {MouseEventHandler, useState} from "react";
import AKCombobox, {IAKComboboxOption} from "@/components/ui-ak/AKCombobox";
import {Universities} from "@/lib/constants/universities";
import {Slider} from "@/components/ui/slider";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {useSBStore} from "@/providers/sb-store-provider";
import AKDatePicker from "@/components/ui-ak/AKDatePicker";

const universities: IAKComboboxOption[] = Universities.map(u => ({
    id: u.id,
    title: u.name,
    searchVariations: u.searchKeywords
}));

export type AddModuleNewProperties = {
    onAddSuccess?: () => void;
}

// TODO: Load from DB and update each session:
const defaultStartDate = new Date(2024, 9, 14);

export default function AddModuleNew(props: AddModuleNewProperties) {
    const apiCreateModule = useSBStore((store) => store.apiCreateModule);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [weeks, setWeeks] = useState(22);

    const [startDate, setStartDate] = useState<Date | undefined>(new Date(defaultStartDate));

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

        if (!startDate) {
            setError("Invalid start date");
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
            const res = await apiCreateModule(name.trim(), code.trim(), weeks, startDate!, universities[0].id, []);
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
            <form>
                <div className="flex flex-col gap-6 mt-4">
                    <div className="grid gap-2">
                        <Label className="text-muted-foreground">University</Label>
                        <AKCombobox options={universities}
                                    className="w-full"
                                    value={universities[0]}
                                    disabled={true}
                        />
                        <p className="text-muted-foreground text-xs">
                            Can&apos;t find your University? Contact us please, we will add it for you in no time.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Module Name</Label>
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
                        <Label htmlFor="code">Module Code</Label>
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
                        <Label htmlFor="weeks">Total weeks: {weeks}</Label>
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
                    <Button type="submit" className="w-full cursor-pointer" variant="outline" onClick={onAddClick}
                            disabled={loading}>
                        Add Module
                    </Button>
                </div>
            </form>
            <AlertDialog open={isConfirmationOpen} onOpenChange={() => setIsConfirmationOpen(false)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmation</AlertDialogTitle>
                        <AlertDialogDescription>
                            This is just a confirmation that you&apos;ve entered correct details.<br/>
                            Are you sure you want to add this module?<br/>
                            <br/>
                            <strong>Name:</strong> {name}<br/>
                            <strong>Code:</strong> {code}<br/>
                            <strong>Weeks:</strong> {weeks}<br/>
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
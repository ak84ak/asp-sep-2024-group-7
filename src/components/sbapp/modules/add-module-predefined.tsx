import {Label} from "@/components/ui/label";
import AKCombobox, {IAKComboboxOption} from "@/components/ui-ak/AKCombobox";
import {Spinner} from "@/components/ui-ak/spinner";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {useSBApi} from "@/hooks/use-sb-api";
import {Universities} from "@/lib/constants/universities";
import AKDatePicker from "@/components/ui-ak/AKDatePicker";

const universities: IAKComboboxOption[] = Universities.map(u => ({
    id: u.id,
    title: u.name,
    searchVariations: u.searchKeywords
}));

export type AddModulePredefinedProperties = {
    onCreateNewSwitch: () => void;
}

// TODO: Load from DB and update each session:
const defaultStartDate = new Date(2024, 9, 14);

export default function AddModulePredefined(props: AddModulePredefinedProperties) {
    const api = useSBApi();

    const [university, setUniversity] = useState<string | undefined>(undefined);
    const [predefinedModules, setPredefinedModules] = useState<IAKComboboxOption[]>([]);
    const [predefinedModulesLoading, setPredefinedModulesLoading] = useState(false);

    const [startDate, setStartDate] = useState<Date | undefined>(new Date(defaultStartDate));

    const onUniversityChange = async (selectedValue: IAKComboboxOption | undefined) => {
        if (!selectedValue) {
            setUniversity(undefined);
        } else {
            setUniversity(selectedValue.id);
        }
        if (university !== selectedValue?.id) {
            setPredefinedModules([]);
            if (selectedValue?.id) {
                setPredefinedModulesLoading(true);
                try {
                    const modules = await api.getPredefinedModules(selectedValue?.id);
                    setPredefinedModules(!modules ? [] : modules.map((module) => ({
                        id: module.id,
                        title: `${module.code ? "(" + module.code + ") " : ""}${module.name}`,
                        searchVariations: [module.name, module.code]
                    })));
                } finally {
                    setPredefinedModulesLoading(false);
                }
            }
        }
    }

    return (
        <div className="flex flex-col gap-6 mt-4">
            <div className="text-muted-foreground text-center">
                <p>We have number of Modules in our database created by users. Try to search for existing Module
                    below.</p>
            </div>
            <div className="grid gap-2">
                <Label className="text-muted-foreground">University</Label>
                <AKCombobox options={universities}
                            emptyText="Select University"
                            searchPlaceholder="Search for University"
                            className="w-full"
                            onChange={onUniversityChange}
                            disabled={predefinedModulesLoading}
                />
            </div>
            {
                predefinedModulesLoading ? (
                    <Spinner size="small"/>
                ) : (
                    <div className="grid gap-2">
                        <Label className="text-muted-foreground">Module</Label>
                        <AKCombobox options={predefinedModules}
                                    emptyText="Select Module"
                                    searchPlaceholder="Search for Module"
                                    className="w-full"
                                    disabled={!university}
                        />
                    </div>
                )
            }
            <div className="grid gap-2">
                <Label htmlFor="code">First week start date</Label>
                <AKDatePicker
                    className="w-full"
                    value={startDate}
                    onChange={(date) => {
                        setStartDate(date);
                    }}
                    placeholder="Pick first week start date (Monday)"
                />
            </div>
            <div className="mt-4 text-center text-sm">
                Can&apos;t find existing module?{" "}
                <Button variant="link" className="underline underline-offset-4 cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            props.onCreateNewSwitch();
                        }}
                >Create a new one</Button>
            </div>
        </div>
    )
}
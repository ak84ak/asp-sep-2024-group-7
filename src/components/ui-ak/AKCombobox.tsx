"use client"

/*

Copied and adapted from https://ui.shadcn.com/docs/components/combobox
Free to use for personal and commercial use.

*/

import {useEffect, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Check, ChevronsUpDownIcon} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {cn} from "@/lib/utils";
import {CommandLoading} from "cmdk";

export interface IAKComboboxOption {
    id: string;
    title: string;
    searchVariations?: string[];
    icon?: React.ReactNode;
}

export interface IAKComboboxValue {
    id: string;
    title: string;
}

export type AKComboboxProperties = {
    value?: IAKComboboxOption;
    options?: IAKComboboxOption[];
    className?: string;
    emptyText?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    onChange?: (value: IAKComboboxOption | undefined) => void;
}

export default function AKCombobox(props: AKComboboxProperties) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState<IAKComboboxValue | undefined>(props.value)

    useEffect(() => {
        setValue(props.value)
    }, [props.value]);

    // TODO: Implement async search
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [currentOptions, setCurrentOptions] = useState<IAKComboboxOption[]>(props.options ?? [])
    const [searchValue, setSearchValue] = useState("")

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [searchInProgress, setSearchInProgress] = useState(false)

    const onSelect = (selectedId: string) => {
        const selectedOption = currentOptions.find((option) => option.id === selectedId);
        setValue(selectedOption);
        if (props.onChange) {
            props.onChange(selectedOption);
        }
        setOpen(false);
    }

    const onSearchValueChange = (newSearchValue: string) => {
        setSearchValue(newSearchValue);
    }

    return (
        <div className={props.className}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open}
                            className={cn("w-full justify-between", value ? "" : "text-muted-foreground")}
                            disabled={props.disabled ?? false}
                    >
                        <div className="flex gap-2 items-center justify-start">
                            { value && props.options?.find(o => o.id === value.id)?.icon }
                            { value ? value.title : props.emptyText ?? "Select..."}
                        </div>
                        <ChevronsUpDownIcon className="opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                    <Command>
                        <CommandInput placeholder={props.searchPlaceholder ?? "Search..."} value={searchValue}
                                      onValueChange={onSearchValueChange}/>
                        <CommandList>
                            {searchInProgress && (
                                <CommandLoading>Searching...</CommandLoading>
                            )}
                            <CommandEmpty>No data found.</CommandEmpty>
                            <CommandGroup>
                                {currentOptions.map((option) => (
                                    <CommandItem
                                        key={option.id}
                                        value={option.id}
                                        onSelect={onSelect}
                                        keywords={option.searchVariations}
                                    >
                                        { option.icon && (
                                            option.icon
                                        )}
                                        {option.title}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                value?.id === option.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
"use client"

/*

Copied and adapted from https://ui.shadcn.com/docs/components/date-picker
Free to use for personal and commercial use.

*/

import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {CalendarIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar";
import {useState} from "react";

export type AKDatePickerProperties = {
    className?: string;
    value?: Date;
    onChange: (date: Date | undefined) => void;
    placeholder?: string;
};

export default function AKDatePicker(props: AKDatePickerProperties) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen} defaultOpen={false}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "justify-start text-left font-normal ml-2",
                        !props.value && "text-muted-foreground",
                        props.className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4"/>
                    {props.value ? format(props.value, "PPP") :
                        <span>{props.placeholder ? props.placeholder : "Pick a date"}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" avoidCollisions={false}>
                <Calendar
                    weekStartsOn={1}
                    mode="single"
                    selected={props.value}
                    defaultMonth={props.value ? props.value : undefined}
                    onSelect={(date) => {
                        props.onChange(date);
                        setIsOpen(false);
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
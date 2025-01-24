import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";

export type AKStyledCheckBoxProperties = {
    id: string;
    name: string;
    checkedIcon: React.ReactNode;
    uncheckedIcon: React.ReactNode;
    checked?: boolean;
    onCheckChange?: (checked: boolean) => void;
}

export default function AKStyledCheckBox(props: AKStyledCheckBoxProperties) {
    const [checked, setChecked] = useState(props.checked || false);

    useEffect(() => {
        setChecked(props.checked || false);
    }, [props.checked]);

    return (
        <div className="inline-flex items-center">
            <input
                id={props.id}
                type="checkbox"
                name={props.name}
                checked={checked}
                onChange={(e) => {
                    setChecked(e.target.checked);
                    if (props.onCheckChange) {
                        props.onCheckChange(e.target.checked);
                    }
                }}
                className="hidden"
            />
            <Button type="button" size={null}
                    className="bg-transparent hover:bg-transparent rounded cursor-pointer"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newValue = !checked;
                        setChecked(newValue);
                        if (props.onCheckChange) {
                            props.onCheckChange(newValue);
                        }
                    }}
            >
                {checked ? props.checkedIcon : props.uncheckedIcon}
            </Button>
        </div>
    );
}
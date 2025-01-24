import {BookOpenTextIcon, CircleHelpIcon, ClapperboardIcon, FlaskConicalIcon, LucideProps} from "lucide-react";
import * as react from "react";

export type ActivityTypeIconProperties = {
    type: string;
}

export default function ActivityTypeIcon(props: ActivityTypeIconProperties & Omit<LucideProps, "ref"> & react.RefAttributes<SVGSVGElement>) {
    switch (props.type) {
        case "video":
            return (<ClapperboardIcon {...props} />)
        case "reading":
            return (<BookOpenTextIcon {...props} />)
        case "lab":
            return (<FlaskConicalIcon {...props} />)
        default:
            return (<CircleHelpIcon {...props} />)
    }
}
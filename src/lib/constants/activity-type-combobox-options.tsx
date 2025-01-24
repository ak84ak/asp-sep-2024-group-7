import {BookOpenTextIcon, CircleHelpIcon, ClapperboardIcon, FlaskConicalIcon} from "lucide-react";

const getActivityTypeComboBoxOptions = () => {
    return [
        {
            id: "video",
            title: "Video",
            icon: <ClapperboardIcon/>
        },
        {
            id: "reading",
            title: "Reading",
            icon: <BookOpenTextIcon/>
        },
        {
            id: "lab",
            title: "Lab",
            icon: <FlaskConicalIcon/>
        },
        {
            id: "other",
            title: "Other",
            icon: <CircleHelpIcon/>
        }
    ]
}

export { getActivityTypeComboBoxOptions };
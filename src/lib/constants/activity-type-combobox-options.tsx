import {
    BookOpenTextIcon,
    CircleHelpIcon,
    ClapperboardIcon,
    FlaskConicalIcon,
    MessageCircleMoreIcon, MessageCircleQuestionIcon, MonitorCheckIcon, UsersIcon
} from "lucide-react";

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
            id: "discussion",
            title: "Discussion",
            icon: <MessageCircleMoreIcon/>
        },
        {
            id: "quiz",
            title: "Quiz",
            icon: <MessageCircleQuestionIcon/>
        },
        {
            id: "practice",
            title: "Practice",
            icon: <MonitorCheckIcon/>
        },
        {
            id: "peer-assignment",
            title: "Peer Assignment",
            icon: <UsersIcon/>
        },
        {
            id: "other",
            title: "Other",
            icon: <CircleHelpIcon/>
        }
    ]
}

export { getActivityTypeComboBoxOptions };
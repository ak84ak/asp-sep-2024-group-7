export type ModuleActivityType =
    "video" | "reading" | "lab" | "discussion" | "quiz" | "practice" | "peer-assignment" | "other";

const mapModuleActivityType = (type: string): ModuleActivityType => {
    switch (type) {
        case "video":
            return "video";
        case "reading":
            return "reading";
        case "lab":
            return "lab";
        case "discussion":
            return "discussion";
        case "quiz":
            return "quiz";
        case "practice":
            return "practice";
        case "peer-assignment":
            return "peer-assignment";
        default:
            // TODO: LOG UNKNOWN TYPES
            return "other";
    }
}

export { mapModuleActivityType };
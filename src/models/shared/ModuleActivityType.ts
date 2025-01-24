export type ModuleActivityType = "video" | "reading" | "lab" | "other";

const mapModuleActivityType = (type: string): ModuleActivityType => {
    switch (type) {
        case "video":
            return "video";
        case "reading":
            return "reading";
        case "lab":
            return "lab";
        default:
            // TODO: LOG UNKNOWN TYPES
            return "other";
    }
}

export { mapModuleActivityType };
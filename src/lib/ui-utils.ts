const formatDuration = (duration: number): string => {
    if (duration < 60) {
        return `${duration} minutes`;
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    return `${hours > 0 ? `${hours}h ` : '' }${minutes > 0 ? `${minutes}m ` : '' }`;
}

export { formatDuration };
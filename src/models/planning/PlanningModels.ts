export interface IPlanningWeek {
    number: number;
    start: Date;
    end: Date;
}

export interface IPlanningWeekAvailability {
    week: number,
    timeAvailable: number,
}
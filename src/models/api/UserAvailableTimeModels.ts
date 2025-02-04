// TODO: Move to domain
//
export interface IUserAvailableTime {
    weeks: IUserAvailableTimeWeek[];
}

export interface IUserAvailableTimeWeek {
    weekStart: Date;
    hoursAvailable: number;
}

export interface IGetUserAvailableTimeResponse {
    availableTime: IUserAvailableTime;
}
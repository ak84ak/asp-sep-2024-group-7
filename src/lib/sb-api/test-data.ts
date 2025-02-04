import {IUserAvailableTime} from "@/models/api/UserAvailableTimeModels";

const availableTime:  IUserAvailableTime = {
    weeks: [
        {
            weekStart: new Date("2025-03-03T00:00:00Z"),
            hoursAvailable: 10
        },
        {
            weekStart: new Date("2025-03-10T00:00:00Z"),
            hoursAvailable: 10
        },
        {
            weekStart: new Date("2025-03-17T00:00:00Z"),
            hoursAvailable: 10
        },
        {
            weekStart: new Date("2025-03-24T00:00:00Z"),
            hoursAvailable: 10
        },
        {
            weekStart: new Date("2025-03-31T00:00:00Z"),
            hoursAvailable: 10
        },
        {
            weekStart: new Date("2025-04-07T00:00:00Z"),
            hoursAvailable: 10
        },
        {
            weekStart: new Date("2025-04-14T00:00:00Z"),
            hoursAvailable: 10
        },
        {
            weekStart: new Date("2025-04-21T00:00:00Z"),
            hoursAvailable: 10
        },
        {
            weekStart: new Date("2025-04-28T00:00:00Z"),
            hoursAvailable: 10
        },
        {
            weekStart: new Date("2025-05-05T00:00:00Z"),
            hoursAvailable: 10
        }

    ]
};

const TEST_DATA = {
    availableTime
};

export default TEST_DATA;
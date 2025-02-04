import * as dayjs from 'dayjs'
import {ICourseModuleActivity} from "@/models/api/ModulesModels";
import {GenomeMetricsRow} from "genetic-search";

interface IActivityExtended extends ICourseModuleActivity {
    module: string;
    order: number;
}

interface IWeekAvailability {
    week: number;
    timeAvailable: number;
}

interface IWeek {
    number: number;
    start: Date;
    end: Date;
}

export interface IEvaluationWeekResult {
    week: number;
    activities: IActivityExtended[];
    timeLeft: number;
}

export interface IPlanEvaluationResult {
    score: number;
    weeks: IEvaluationWeekResult[];
    issues: string[];
    notPlanned: IActivityExtended[];
    hasMissedDeadlines: boolean;
    notEnoughTime: boolean;
    unplannedTime: number;
}

// Evaluates a plan (genome) simulating doing the activities in the given order
// and applies penalties and bonuses.
// Returns a score based on the evaluation.
export default class PlanEvaluator {
    private activitiesToArrange: IActivityExtended[];
    private availability: IWeekAvailability[];
    private startDate: Date;
    private weeks: IWeek[];

    private activitiesByIdMap: Map<string, IActivityExtended>;

    // Penalties and bonuses
    private static readonly EARLIER_FINISH_BONUS = 10;
    private static readonly WRONG_ORDER_PENALTY = 1000;
    private static readonly FREE_TIME_LEFT_PENALTY_MULTIPLIER = 100;
    private static readonly BIG_MODULES_DIFFERENCE_PENALTY = 100;
    private static readonly NO_TIME_AVAILABLE_PENALTY = 10000;
    private static readonly MISSED_DEADLINE_PENALTY = 1000000;

    constructor(activitiesToArrange: IActivityExtended[], availability: IWeekAvailability[], currentDate: Date, weeks: IWeek[]) {
        this.activitiesToArrange = activitiesToArrange;
        this.availability = availability;
        this.startDate = currentDate;
        this.weeks = weeks;

        this.activitiesByIdMap = new Map<string, IActivityExtended>();
        activitiesToArrange.forEach(activity => this.activitiesByIdMap.set(activity.id, activity));
    }

    // Full evaluation of the plan (genome) with penalties and bonuses for each activity
    public evaluate(activitiesToEvaluate: string[]): GenomeMetricsRow {
        if (activitiesToEvaluate.length !== this.activitiesToArrange.length) {
            throw new Error("Invalid number of activities to evaluate");
        }

        const activities = activitiesToEvaluate.map(id => this.activitiesByIdMap.get(id)!);

        let score = 0;

        let currentDate = dayjs.default(this.startDate);
        let currentWeek = this.weeks.find(week => (currentDate.isSame(week.start) || currentDate.isAfter(week.start))
            && (currentDate.isSame(week.end) || currentDate.isBefore(week.end)))!;
        let currentWeekAvailability = this.availability.find(week => week.week === currentWeek.number)!.timeAvailable;

        const lastOrderMap = new Map<string, number>();
        const lastWeekMap = new Map<string, number>();
        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];

            const lastOrder = lastOrderMap.get(activity.module);
            const lastWeek = lastWeekMap.get(activity.module);

            if (lastOrder) {
                // The plan contains activities that are not in the correct order
                if (lastOrder > activity.order) {
                    score -= PlanEvaluator.WRONG_ORDER_PENALTY;
                    lastOrderMap.set(activity.module, activity.order);
                } else {
                    if (lastWeek) {
                        // The plan contains activities from the later weeks before the activities from the earlier weeks
                        if (lastWeek > activity.week) {
                            score -= PlanEvaluator.WRONG_ORDER_PENALTY;
                            lastWeekMap.set(activity.module, activity.week);
                        }
                    } else {
                        lastWeekMap.set(activity.module, activity.week);
                    }
                }
            } else {
                lastOrderMap.set(activity.module, activity.order);
            }
        }

        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];

            if (currentWeekAvailability < activity.duration) {
                // next week
                const nextWeek = this.weeks.find(week => week.number === currentWeek.number + 1);
                if (!nextWeek) {
                    // no more weeks
                    score -= PlanEvaluator.NO_TIME_AVAILABLE_PENALTY;

                    for (let q = i; q < activities.length; q++) {
                        const comparedActivity = activities[q];
                        if (comparedActivity.deadline) {
                            score -= PlanEvaluator.MISSED_DEADLINE_PENALTY;
                        }
                    }

                    break;
                }

                // Penalize for free time left in the week
                score -= currentWeekAvailability * PlanEvaluator.FREE_TIME_LEFT_PENALTY_MULTIPLIER;

                currentDate = dayjs.default(nextWeek!.start);
                currentWeek = nextWeek!;
                currentWeekAvailability = this.availability.find(week => week.week === currentWeek.number)!.timeAvailable;
                i--;
                continue;
            }

            currentWeekAvailability -= activity.duration;

            // Penalize for missed deadlines (the critical penalty)
            if (activity.deadline && (currentDate.isAfter(activity.deadline) || currentDate.isSame(activity.deadline))) {
                score -= PlanEvaluator.MISSED_DEADLINE_PENALTY;
            }

            for (let q = i - 1; q >= 0; q--) {
                const previousActivity = activities[q];

                // Penalize for cases like
                // Week 1: Module A, Week 2: Module A, Week 3: Module A, Week 4: Module A
                // Week 5: Module B, Week 6: Module B, Week 7: Module B, Week 8: Module B
                // To ensure that the activities from different modules are distributed evenly
                if (previousActivity.module !== activity.module && Math.abs(previousActivity.week - activity.week) > 2) {
                    score -= PlanEvaluator.BIG_MODULES_DIFFERENCE_PENALTY;
                }
            }

            // Bonus for finishing the activity earlier
            if (currentWeek.number < activity.week) {
                score += PlanEvaluator.EARLIER_FINISH_BONUS;
            }
        }

        return [score];
    }

    // Quick evaluation of the plan to estimate time on weekly basis
    public evaluateByWeeks(activitiesToEvaluate: string[]): IPlanEvaluationResult {
        if (activitiesToEvaluate.length !== this.activitiesToArrange.length) {
            throw new Error("Invalid number of activities to evaluate");
        }

        const activities = activitiesToEvaluate.map(id => this.activitiesByIdMap.get(id)!);

        let currentDate = dayjs.default(this.startDate);
        let currentWeek = this.weeks.find(week => (currentDate.isSame(week.start) || currentDate.isAfter(week.start))
            && (currentDate.isSame(week.end) || currentDate.isBefore(week.end)))!;
        let currentWeekAvailability = this.availability.find(week => week.week === currentWeek.number)!.timeAvailable;

        let currentWeekResult: IEvaluationWeekResult = {
            week: currentWeek.number,
            activities: [],
            timeLeft: currentWeekAvailability
        };

        const issues: string[] = [];
        const result: IPlanEvaluationResult = {
            score: 0,
            weeks: [currentWeekResult],
            issues: issues,
            notPlanned: [],
            hasMissedDeadlines: false,
            notEnoughTime: false,
            unplannedTime: 0
        };

        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];

            if (currentWeekAvailability < activity.duration) {
                // next week
                const nextWeek = this.weeks.find(week => week.number === currentWeek.number + 1);
                if (!nextWeek) {
                    // no more weeks
                    result.issues.push(`NOT ENOUGH TIME!`);
                    result.notPlanned = activities.slice(i);
                    result.notEnoughTime = true;

                    for (let q = i; q < activities.length; q++) {
                        const comparedActivity = activities[q];
                        if (comparedActivity.deadline) {
                            result.hasMissedDeadlines = true;
                            result.issues.push(`MISSED DEADLINE!`);
                        }
                    }

                    const timeLeft = activities.slice(i).reduce((acc, activity) => acc + activity.duration, 0);
                    result.unplannedTime = timeLeft;
                    break;
                }

                currentDate = dayjs.default(nextWeek!.start);
                currentWeek = nextWeek!;
                currentWeekAvailability = this.availability.find(week => week.week === currentWeek.number)!.timeAvailable;
                i--;

                currentWeekResult = {
                    week: currentWeek.number,
                    activities: [],
                    timeLeft: currentWeekAvailability
                };
                result.weeks.push(currentWeekResult);

                continue;
            }

            currentWeekAvailability -= activity.duration;

            currentWeekResult.activities.push(activity);
            currentWeekResult.timeLeft = currentWeekAvailability;

            if (activity.deadline && (currentDate.isAfter(activity.deadline) || currentDate.isSame(activity.deadline))) {
                result.issues.push(`MISSED DEADLINE !!!`);
                result.hasMissedDeadlines = true;
            }
        }

        return result;
    }
}

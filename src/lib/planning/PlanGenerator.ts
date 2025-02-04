import {
    BaseGenome,
    BaseMetricsStrategy, BaseMutationStrategy, BaseMutationStrategyConfig, CrossoverStrategyInterface,
    FitnessStrategyInterface,
    GenerationFitnessColumn,
    GenerationMetricsMatrix,
    GeneticSearch,
    GeneticSearchConfig,
    GeneticSearchStrategyConfig,
    IdGeneratorInterface,
    MetricsStrategyConfig,
    PopulateStrategyInterface,
    SimpleMetricsCache
} from "genetic-search";
import PlanEvaluator, {IPlanEvaluationResult} from "@/lib/planning/PlanEvaluator";
import {ICourseModule, ICourseModuleActivity} from "@/models/domain/ModulesModels";

// TODO: Move to models folder (for now kept here for simplicity and modularity)
interface IActivityExtended extends ICourseModuleActivity {
    module: string;
    order: number;
}

interface IWeek {
    number: number;
    start: Date;
    end: Date;
}

interface IWeekAvailability {
    week: number;
    timeAvailable: number;
}

type ActivitiesGenome = BaseGenome & {
    id: number;
    activities: string[];
};

type ActivityTaskConfig = string[];

//// Helper functions
// TODO: Move to a separate file (for now kept here for simplicity and modularity)

// Shuffles an array and returns a new one
function shuffle<T>(array: T[]) {
    const shuffled = array.slice();
    let currentIndex = shuffled.length;
    let temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = shuffled[currentIndex];
        shuffled[currentIndex] = shuffled[randomIndex];
        shuffled[randomIndex] = temporaryValue;
    }
    return shuffled;
}

function getRandomInt(min: number, max: number) {
    return min + Math.floor(Math.random() * max);
}

function sortActivities(activitiesToSort: string[], activityMap: Map<string, IActivityExtended>): string[] {

    const activities = activitiesToSort.map(id => activityMap.get(id)!);

    for (let i = 0; i < activities.length - 1; i++) {
        for (let j = i + 1; j < activities.length; j++) {
            let a = activities[i];
            let b = activities[j];

            // TODO: Order by week as well
            if (a.module == b.module) {
                if (a.order > b.order) {
                    const temp = activities[i];
                    activities[i] = activities[j];
                    activities[j] = temp;

                    a = activities[i];
                    b = activities[j];
                }
            }
        }
    }

    return activities.map(activity => activity.id);
}

// Activities genome population strategy
class ActivityPopulateStrategy implements PopulateStrategyInterface<ActivitiesGenome> {
    constructor(private activities: IActivityExtended[], private activityMap: Map<string, IActivityExtended>) {
    }

    populate(size: number, idGenerator: IdGeneratorInterface<ActivitiesGenome>): ActivitiesGenome[] {
        const result: ActivitiesGenome[] = [];

        // TODO: Remove after finishing with experiments
        //const sortedByWeek = this.activities.sort((a, b) => a.week - b.week);
        // add as it is
        //result.push({id: idGenerator.nextId(), activities: sortedByWeek.map(activity => activity.id)});

        // populate others randomly
        while (result.length < size) {
            result.push({
                id: idGenerator.nextId(),
                activities: sortActivities(shuffle(this.activities.map(activity => activity.id)), this.activityMap)
            });
        }
        return result;
    }
}

class ActivityMetricsStrategy extends BaseMetricsStrategy<ActivitiesGenome, MetricsStrategyConfig<ActivityTaskConfig>, ActivityTaskConfig> {
    protected createTaskInput(genome: ActivitiesGenome): ActivityTaskConfig {
        return genome.activities;
    }
}

class ActivityMaxValueFitnessStrategy implements FitnessStrategyInterface {
    score(results: GenerationMetricsMatrix): GenerationFitnessColumn {
        return results.map((result) => result[0]);
    }
}

// Mutation strategy - Switch 2 activities random number of times (1 to activities.length)
// with a probability of 0.3
class ActivitiesMutationStrategy extends BaseMutationStrategy<ActivitiesGenome, BaseMutationStrategyConfig> {
    constructor(private activityMap: Map<string, IActivityExtended>) {
        super({probability: 0.3});
    }

    mutate(genome: ActivitiesGenome, newGenomeId: number): ActivitiesGenome {
        // Randomly switch 2 activities

        //const times = getRandomInt(1, genome.activities.length / 2);
        //const times = 1;
        const times = getRandomInt(1, genome.activities.length);

        const newActivities = genome.activities.slice();

        for (let i = 0; i < times; i++) {
            const index1 = Math.floor(Math.random() * newActivities.length);
            const index2 = Math.floor(Math.random() * newActivities.length);
            const temp = newActivities[index1];
            newActivities[index1] = newActivities[index2];
            newActivities[index2] = temp;
        }

        return {id: newGenomeId, activities: sortActivities(newActivities, this.activityMap)};
    }
}

// Common GA crossover strategy - selects activities from both parents
class ActivitiesCrossoverStrategy implements CrossoverStrategyInterface<ActivitiesGenome> {
    constructor(private activityMap: Map<string, IActivityExtended>) {
    }

    cross(lhs: ActivitiesGenome, rhs: ActivitiesGenome, newGenomeId: number): ActivitiesGenome {

        const newActivities: string[] = [];

        let iL = 0;
        let iR = 0;

        while (iL < lhs.activities.length && iR < rhs.activities.length) {
            const activity = Math.random() < 0.5 ? lhs.activities[iL++] : rhs.activities[iR++];
            if (!newActivities.includes(activity)) {
                newActivities.push(activity);
            }
        }

        return {id: newGenomeId, activities: sortActivities(newActivities, this.activityMap)};
    }
}

// Main plan generator class
export default class SBPlanGenerator {
    private generations: number;
    private populationSize: number;
    private onIteration: ((generation: number, bestPlan: IPlanEvaluationResult) => void) | undefined;

    constructor(generations: number, populationSize: number, onIteration?: (generation: number, bestPlan: IPlanEvaluationResult) => void) {
        this.generations = generations;
        this.populationSize = populationSize;
        this.onIteration = onIteration;
    }

    // Starts the plan generation process
    public async generatePlan(modules: ICourseModule[], availability: IWeekAvailability[], currentDate: Date, weeks: IWeek[]): Promise<IPlanEvaluationResult> {
        const config: GeneticSearchConfig = {
            populationSize: this.populationSize,
            survivalRate: 0.3,
            crossoverRate: 0.3
        };

        // Flatten activities and ignore completed ones
        const activitiesToArrange: IActivityExtended[] = [];
        modules.forEach(module => {
            let order = 1;
            for (let i = 0; i < module.activities.length; i++) {
                const activity = module.activities[i];
                if (activity.isCompleted) {
                    continue;
                }
                activitiesToArrange.push({...activity, module: module.code, order: order++});
            }
        });

        const activityMap = new Map<string, IActivityExtended>();
        activitiesToArrange.forEach(activity => activityMap.set(activity.id, activity));

        const totalDuration = activitiesToArrange.reduce((acc, activity) => acc + activity.duration, 0);
        console.log('Total duration:', totalDuration);
        const totalAvailability = availability.reduce((acc, week) => acc + week.timeAvailable, 0);
        console.log('Total availability:', totalAvailability);

        const evaluator = new PlanEvaluator(activitiesToArrange, availability, currentDate, weeks);

        // GA configuration
        const strategies: GeneticSearchStrategyConfig<ActivitiesGenome> = {
            populate: new ActivityPopulateStrategy(activitiesToArrange, activityMap),
            metrics: new ActivityMetricsStrategy({
                task: async (data) => evaluator.evaluate(data),
                onTaskResult: () => void 0,
            }),
            fitness: new ActivityMaxValueFitnessStrategy(),
            mutation: new ActivitiesMutationStrategy(activityMap),
            crossover: new ActivitiesCrossoverStrategy(activityMap),
            cache: new SimpleMetricsCache(),
        }

        const search = new GeneticSearch(config, strategies);

        const step = 10;
        let currentGeneration = 0;

        // Run the GA in steps to free the event loop and allow UI updates
        while (currentGeneration < this.generations) {
            await this.freeLoop();
            await search.fit({
                generationsCount: step,
                beforeStep: () => void 0,
                afterStep: (gen, scores) => {
                    if (this.onIteration) {
                        const tempPlan = evaluator.evaluateByWeeks(search.bestGenome.activities);
                        this.onIteration(gen, tempPlan);
                    }
                }
            });
            currentGeneration += step;
        }

        const bestGenome = search.bestGenome;
        console.log('Best genome:', bestGenome);
        console.log('Best score:', bestGenome.stats?.fitness);

        const result = evaluator.evaluateByWeeks(bestGenome.activities);
        return result;
    }

    // Hack to free the event loop
    private freeLoop() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(void 0);
            }, 0);
        });
    }
}
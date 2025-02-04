import {useSBStore} from "@/providers/sb-store-provider";
import React, {useEffect, useState} from "react";
import {Spinner} from "@/components/ui-ak/spinner";
import {Button} from "@/components/ui/button";
import {ICourseModuleActivity} from "@/models/api/ModulesModels";
import {IPlanningWeek, IPlanningWeekAvailability} from "@/models/planning/PlanningModels";
import dayjs from "dayjs";
import {IPlanEvaluationResult} from "@/lib/planning/PlanEvaluator";

const planningGenerations = 1000;
const populationSize = 50;

export default function AvailableTime() {
    const availableTime = useSBStore((store) => store.availableTime);
    const modules = useSBStore((store) => store.modules);
    const apiLoadAvailableTime = useSBStore((store) => store.apiLoadAvailableTime);
    const apiLoadModules = useSBStore((store) => store.apiLoadModules);

    const [activitiesToPlan, setActivitiesToPlan] = useState<ICourseModuleActivity[] | undefined>(undefined);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [currentGeneration, setCurrentGeneration] = useState<number>(0);

    const [tempPlan, setTempPlan] = useState<IPlanEvaluationResult | null>(null);
    const [plan, setPlan] = useState<IPlanEvaluationResult | null>(null);
    const [weeks, setWeeks] = useState<IPlanningWeek[]>([]);
    const [availability, setAvailability] = useState<IPlanningWeekAvailability[]>([]);

    useEffect(() => {
        apiLoadAvailableTime().then(() => {
        });
        apiLoadModules(false).then(() => {
        });
    }, [apiLoadAvailableTime, apiLoadModules]);

    useEffect(() => {
        if (!modules) {
            return;
        }

        const activities = modules.flatMap(module => module.activities).filter(a => !a.isCompleted);
        setActivitiesToPlan(activities);
    }, [modules]);

    const startPlanGeneration = () => {
        setIsGeneratingPlan(true);
    }

    return (
        <>
            {availableTime === undefined || modules === undefined || activitiesToPlan === undefined ? (
                <div className="w-full h-full mx-auto flex flex-col items-center justify-center">
                    <div><Spinner size="large"/></div>
                    <div>
                        <p className="text-lg">Loading data...</p>
                    </div>
                </div>
            ) : (
                <div>
                    <div>
                        Configured available time
                        <Button variant="link" className="underline underline-offset-4">Update</Button>
                        <div className="flex flex-row gap-4 flex-wrap justify-evenly">
                            {availableTime.weeks.map((week, index) => (
                                <div key={week.weekStart.toISOString()} className="rounded-xl p-4 max-w-sm">
                                    <div className="flex flex-col items-center justify-between">
                                        <h2 className="text-base font-semibold">Week {index + 1}</h2>
                                        <div className="text-sm font-semibold">{week.hoursAvailable} hours</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        Activities to plan
                        {activitiesToPlan?.map(activity => (
                            <div key={activity.id} className="rounded-xl p-4 max-w-sm">
                                <div className="flex flex-col items-center justify-between">
                                    <h2 className="text-base font-semibold">{activity.name}</h2>
                                    <div className="text-sm font-semibold">{activity.duration} hours</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <Button size="lg" onClick={startPlanGeneration} disabled={isGeneratingPlan}>
                            {isGeneratingPlan && <Spinner size="small" className="text-black"/>}
                            {isGeneratingPlan ? "Generation in progress" : "Generate plan"}
                        </Button>
                    </div>
                    {isGeneratingPlan && (
                        <div>
                            <p>Generation: {Math.round((currentGeneration / planningGenerations) * 100.0)}%</p>
                            {tempPlan != null && (
                                <div>
                                    <h4>Current best plan</h4>

                                    <table className="table">
                                        <tbody>
                                        {tempPlan.weeks.map((week) => (
                                            <tr key={week.week}>
                                                <td style={{maxWidth: "90px", width: "90px"}}>Week {week.week}</td>
                                                <td>
                                                    <div className="w-auto rounded"
                                                         style={{
                                                             padding: "0px 2px 6px 2px",
                                                             border: "1px solid #555",
                                                             //height: "16px",
                                                             //maxWidth: "600px",
                                                         }}
                                                    >
                                                        {week.activities.map((activity) => (
                                                            <div className="d-inline-block" key={activity.id}
                                                                 style={{
                                                                     width: `${(activity.duration / availability.find((x) => x.week == week.week)!.timeAvailable) * 100}%`,
                                                                     minWidth: "1px",
                                                                     height: "12px",
                                                                     margin: "0",
                                                                     padding: "0 2px",
                                                                 }}
                                                            >
                                                                <div className="rounded bg-success text-center"
                                                                     style={{
                                                                         height: "100%",
                                                                         width: "100%",
                                                                         fontSize: "8px",
                                                                     }}>
                                                                    {activity.duration}m
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td>To plan</td>
                                            <td>
                                                {tempPlan.notPlanned.map((activity) => (
                                                    <div key={activity.id}
                                                        className="d-inline-block"
                                                        style={{
                                                            width: `${(activity.duration / availability.reduce((p, c) => Math.max(p, c.timeAvailable), 0)) * 100}%`,
                                                            minWidth: "1px",
                                                            height: "12px",
                                                            padding: "0 2px",
                                                        }}
                                                    >
                                                        <div
                                                            className={`rounded text-center ${activity.deadline ? "bg-danger" : "bg-primary"}`}
                                                            style={{
                                                                height: "100%", width: "100%",
                                                                fontSize: "8px"
                                                            }}>
                                                            {activity.duration}m
                                                        </div>
                                                    </div>
                                                ))}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {plan != null && (
                        <div className="my-3">
                            {plan.issues.length > 0 && (
                                <div>
                                    <h4>There were some problems</h4>
                                    <p className="text-danger">
                                        {plan.issues.length} issue(s) found
                                    </p>
                                    <ul>
                                        {plan.issues.map((issue, index) => (
                                            <li key={index}>{issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <h4>Generated plan</h4>
                            {plan.weeks.map((week) => (
                                <div key={week.week}>
                                    <h5>
                                        Week {week.week} -
                                        (starts {dayjs(weeks.find((w) => w.number == week.week)?.start).format("DD.MM.YYYY")})
                                        - free time left: {week.timeLeft} min(s)
                                    </h5>
                                    <table className="table">
                                        <thead>
                                        <tr>
                                            <th scope="col">Module</th>
                                            <th scope="col">Week</th>
                                            <th scope="col">Activity</th>
                                            <th scope="col">Duration</th>
                                            <th scope="col">Deadline</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {week.activities.map((activity, index) => (
                                            <tr key={index}>
                                                <td>{activity.module}</td>
                                                <td>{activity.week}</td>
                                                <td>{activity.name}</td>
                                                <td>{activity.duration} min</td>
                                                <td>{activity.deadline != null ? dayjs(activity.deadline).format("DD.MM.YYYY") : "NO"}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                            {plan.notPlanned.length > 0 && (
                                <div>
                                    <h4 className="text-danger">
                                        Missed activities (time left: {plan.unplannedTime} min(s))
                                    </h4>
                                    <table className="table">
                                        <thead>
                                        <tr>
                                            <th scope="col">Module</th>
                                            <th scope="col">Week</th>
                                            <th scope="col">Activity</th>
                                            <th scope="col">Duration</th>
                                            <th scope="col">Deadline</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {plan.notPlanned.map((activity, index) => (
                                            <tr key={index}>
                                                <td>{activity.module}</td>
                                                <td>{activity.week}</td>
                                                <td>{activity.name}</td>
                                                <td>{activity.duration} min</td>
                                                <td>{activity.deadline != null ? dayjs(activity.deadline).format("DD.MM.YYYY") : "NO"}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            )}
        </>
    )
}
"use client"

import {useContext, useEffect} from "react";
import {HomeContext} from "@/app/(home)/template";

export default function AboutPage() {
    const pageContext = useContext(HomeContext);

    useEffect(() => {
        pageContext.setShowFeaturesLink(false);
    }, [ pageContext ]);

    return (
        <>
            <main className="flex flex-col gap-8 row-start-2 items-start sm:items-start self-start">
                <div className="mx-auto text-justify w-full sm:w-[70vw] text-base leading-9">
                    <h1 className="text-xl mt-3 font-semibold">About</h1>
                    <p>Study Buddy is a web app created to help online university students manage their studies in a smarter and easier way.</p>
                    <p>It started as a small project for one of our courses at the University of London. Our task was to build a useful tool as part of our studies.
                        After working on the first version of Study Buddy, we realised that this app could really help many other students like us – people who study remotely,
                        work part-time, or just find it hard to stay organized.</p>

                    <p>That’s why we decided to keep working on the app and make it available for everyone. Now, Study Buddy helps students create personalized study plans,
                        track their progress, and stay motivated from start to finish.</p>

                    <p>And the best part – it&apos;s free to use! At least for now in beta stage.</p>

                    <h2 className="text-lg mt-2 font-semibold">The Team</h2>
                    <p>We are four students from the University of London who know the struggles of online learning. We built Study Buddy because we needed something like this ourselves.</p>

                    <p>We are not a big company (actually, we are not a company at all). We are just students helping other students.</p>

                    <h2 className="text-lg mt-2 font-semibold">Why we built Study Buddy</h2>
                    <p>We know how hard it is to balance studies, work, and life. Many of us have missed deadlines, forgotten tasks, or felt lost with too many things to do.</p>
                    <p>With Study Buddy, we wanted to create something simple but powerful – a tool that gives you control, saves your time, and helps you stay focused on your goals.</p>

                    <p>Thank you for trying Study Buddy! We hope it helps you as much as it helps us. Feel free to contact us at any time.</p>
                </div>
            </main>
        </>
    );
}

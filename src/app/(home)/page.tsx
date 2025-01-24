"use client"

import {MouseEventHandler, useContext} from "react";
import TypewriterEffectMultiple from "@/components/ui-ak/typewriter-multiple";
import {
    ArrowRightIcon, BellRingIcon, BicepsFlexedIcon,
    ChartNoAxesCombinedIcon, GlobeIcon,
    GraduationCapIcon,
    ImportIcon,
    LockIcon, MessageCircleQuestionIcon
} from "lucide-react";
import Link from "next/link";
import AKFeatureCard from "@/components/ui-ak/ak-feature-card";
import {HomeContext} from "@/app/(home)/template";

const parseSlogans = (slogans: string[]) => {
    return slogans.map(slogan => {
        let duration = 2;
        if (slogan.startsWith("(")) {
            const parts = slogan.split(")");
            duration = parseFloat(parts[0].replace("(", ""));
            slogan = parts[1].trim();
        }
        return {
            words: slogan.split(" ").map(word => {
                if (word.includes("#")) {
                    const parts = word.split("#");
                    const text = parts[0];
                    const className = parts[1].replace("...", " ");

                    return {
                        text: text,
                        className: className
                    }
                }
                return {
                    text: word
                }
            }),
            duration: duration
        }
    });
}

const slogans = parseSlogans(
    [
        "(1) Study smarter.#text-blue-500...dark:text-blue-500",
        "(1) Stay on track.#text-blue-500...dark:text-blue-500",
        "(2) Turn chaos into a clear plan.#text-blue-500...dark:text-blue-500",
        "(2) Never miss a deadline#text-blue-500...dark:text-blue-500 again.",
        "(1.5) Get organized.#text-blue-500...dark:text-blue-500 Stay ahead.",
        "(1.5) Study plans#text-blue-500...dark:text-blue-500 that actually work.#text-blue-500...dark:text-blue-500",
        "(2) Stay in control,#text-blue-500...dark:text-blue-500 even when life is busy."
    ]
);

export default function Home() {
    const pageContext = useContext(HomeContext);

    const onCTA: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        pageContext.setIsSignInDialogOpen(true);
        pageContext.setSignInDialogTab("signup");
    }

    return (
        <>
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <div className="mx-auto text-center w-full sm:w-[50vw] text-xl">
                    <h1 className="text-4xl font-semibold mb-5">Welcome to Study Buddy!</h1>
                    <h2 className="text-lg">A web app to help remote university students organize their studies
                        with AI-powered plans, progress tracking, and smart tools.</h2>
                </div>
                <div className="w-full sm:w-[70vw]">
                    <TypewriterEffectMultiple texts={slogans}/>
                </div>
                <div className="text-center mx-auto">
                    <button
                        className="text-lg relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden font-medium text-gray-900
                            rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white
                            dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
                        onClick={onCTA}
                    >
                            <span
                                className="[text-shadow:rgb(0_0_0_/_50%)_0_0_4px] cursor-pointer relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                                Get started <ArrowRightIcon className="inline size-5 ml-1 mb-0.5"/>
                            </span>
                    </button>
                </div>
                <div className="text-center mx-auto">
                    <Link href="#features"
                          className="underline underline-offset-8 decoration-indigo-300 decoration-dashed">Why you
                        should try this app?</Link>
                </div>
                <div id="features" className="mx-auto mt-24">
                    <div className="px-8">
                        <h4 className="text-2xl lg:text-4xl lg:leading-tight max-w-4xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
                            Packed with all essential features
                        </h4>

                        <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
                            Create your own study plan. Track your progress. Stay on track with help from AI.
                        </p>
                    </div>
                    <div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-[70vw] mx-auto">
                        <AKFeatureCard title="Personalized Study Plans"
                                       description="The app creates realistic study schedules just for you. Add your courses, time, and tasks - the AI does the rest."
                                       icon={<GraduationCapIcon/>} index={0}/>
                        <AKFeatureCard title="Track Your Progress"
                                       description="Mark tasks as done. See charts that compare your real progress with the plan. Get suggestions when you fall behind."
                                       icon={<ChartNoAxesCombinedIcon/>} index={1}/>
                        <AKFeatureCard title="Safe to Use"
                                       description="We care about your privacy. We do NOT collect or keep personal data."
                                       icon={<LockIcon/>} index={2}/>
                        <AKFeatureCard title="Easy Import"
                                       description="Copy-paste your course info from places like Coursera - no need to type everything."
                                       icon={<ImportIcon/>} index={3}/>
                        <AKFeatureCard title="Full Control"
                                       description="Change your plan anytime. Move tasks, add new ones, or take a break without losing track."
                                       icon={<BicepsFlexedIcon/>} index={4}/>
                        <AKFeatureCard title="Built for Online Students"
                                       description="We understand your needs and designed this app just for you. Because we're online students too :)"
                                       icon={<GlobeIcon/>} index={4}/>
                        <AKFeatureCard title="Flashcards and Quizzes (Coming Soon)"
                                       description="Make flashcards and small tests from your study materials. Find weak spots and improve faster."
                                       icon={<MessageCircleQuestionIcon/>} index={5}/>
                        <AKFeatureCard title="Helpful Reminders (Coming Soon)"
                                       description="Don’t miss deadlines! Get friendly notifications if you fall behind, plus ideas to fix your schedule."
                                       icon={<BellRingIcon/>} index={6}/>
                    </div>
                </div>
                <div className="text-center mx-auto">
                    <button
                        className="text-lg relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden font-medium text-gray-900
                            rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white
                            dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
                        onClick={onCTA}
                    >
                            <span
                                className="[text-shadow:rgb(0_0_0_/_50%)_0_0_4px] cursor-pointer relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                                Get started <ArrowRightIcon className="inline size-5 ml-1 mb-0.5"/>
                            </span>
                    </button>
                </div>
            </main>
        </>
    );
}

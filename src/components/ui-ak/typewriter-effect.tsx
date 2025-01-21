"use client";

/*

Copied and adapted from https://ui.aceternity.com/components/typewriter-effect
Free to use for personal and commercial use.

*/

import {cn} from "@/lib/utils";
import {motion, stagger, useAnimate, useInView} from "framer-motion";
import {useEffect, useState} from "react";

export const TypewriterEffectSmooth = ({
                                           words,
                                           className,
                                           cursorClassName,
                                           onAnimationComplete,
                                           duration
                                       }: {
    words: {
        text: string;
        className?: string;
    }[];
    className?: string;
    cursorClassName?: string;
    onAnimationComplete?: () => void;
    duration: number;
}) => {
    const [ targetWidth, setTargetWidth ] = useState("fit-content");
    const [ currentDuration, setCurrentDuration ] = useState(duration);

    const onAnimationCompleteHandler = () => {
        if (targetWidth === "fit-content") {
            const timeout = setTimeout(() => {
                clearTimeout(timeout);
                setTargetWidth("0%");
                setCurrentDuration(0.5);
                const timeout2 = setTimeout(() => {
                    clearTimeout(timeout2);
                    if (onAnimationComplete) {
                        onAnimationComplete();
                    }
                }, 2000);
            }, 2000);
        }
    }

    useEffect(() => {
        setTargetWidth("fit-content");
        setCurrentDuration(duration);
    }, [words, duration]);

    // split text inside of words into array of characters
    const wordsArray = words.map((word) => {
        return {
            ...word,
            text: word.text.split(""),
        };
    });
    const renderWords = () => {
        return (
            <div>
                {wordsArray.map((word, idx) => {
                    return (
                        <div key={`word-${idx}`} className="inline-block">
                            {word.text.map((char, index) => (
                                <span
                                    key={`char-${index}`}
                                    className={cn(`dark:text-white text-black `, word.className)}
                                >
                  {char}
                </span>
                            ))}
                            &nbsp;
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={cn("flex space-x-1 my-6 mx-auto justify-center", className)}>
            <motion.div
                onAnimationComplete={onAnimationCompleteHandler}

                className="overflow-hidden pb-2"
                initial={{
                    width: "0%",
                }}
                whileInView={{
                    width: targetWidth,
                }}
                transition={{
                    duration: currentDuration,
                    ease: "linear",
                    delay: 1
                }}
            >
                <div
                    className="text-base sm:text-2xl md:text-3xl lg:text:3xl xl:text-5xl font-bold"
                    style={{
                        whiteSpace: "nowrap",
                    }}
                >
                    {renderWords()}{" "}
                </div>
                {" "}
            </motion.div>
            <motion.span
                initial={{
                    opacity: 1,
                }}
                // animate={{
                //     opacity: 1,
                // }}
                // transition={{
                //     duration: 0.8,
                //
                //     repeat: Infinity,
                //     repeatType: "reverse",
                // }}
                className={cn(
                    "block rounded-sm w-[4px]  h-4 sm:h-6 xl:h-12 bg-blue-500",
                    cursorClassName
                )}
            ></motion.span>
        </div>
    );
};

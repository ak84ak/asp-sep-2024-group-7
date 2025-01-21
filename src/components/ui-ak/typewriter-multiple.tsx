import {useEffect, useState} from "react";
import {TypewriterEffectSmooth} from "@/components/ui-ak/typewriter-effect";

type TypewriterEffectMultipleProps = {
    texts: {
        words: {
            text: string;
            className?: string;
        }[],
        duration?: number;
    }[]
}

export default function TypewriterEffectMultiple(props: TypewriterEffectMultipleProps) {
    const [currentWords, setCurrentWords] = useState<{
        text: string;
        className?: string;
    }[]>([]);

    const [ currentDuration, setCurrentDuration ] = useState(2);
    const [ currentIndex, setCurrentIndex ] = useState(0);

    const onAnimationComplete = () => {
        let nextIndex = Math.floor(Math.random() * props.texts.length);
        if (nextIndex == currentIndex) {
            nextIndex = (nextIndex + 1) % props.texts.length;
        }
        const nextText = props.texts[nextIndex];
        setCurrentIndex(nextIndex);
        setCurrentWords(nextText.words);
        setCurrentDuration(nextText.duration || 2);
    }

    useEffect(() => {
        setCurrentIndex(0);
        setCurrentWords(props.texts[0].words);
        setCurrentDuration(props.texts[0].duration || 2);
    }, [props.texts]);

    return (
        <TypewriterEffectSmooth
            words={currentWords}
            onAnimationComplete={ onAnimationComplete }
            duration={currentDuration}
        />
    )
}
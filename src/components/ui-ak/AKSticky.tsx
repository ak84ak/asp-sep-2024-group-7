"use client"

import {useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";

export type AKStickyProperties = {
    children: React.ReactNode;
    containerRef: React.RefObject<HTMLDivElement | null>;
    topOffset?: number;
    className?: string;
}

export default function AKSticky({ children, containerRef, className, topOffset }: AKStickyProperties) {
    const stickyRef = useRef<HTMLDivElement>(null);
    const [isSticky, setIsSticky] = useState(false);
    const [offsetY, setOffsetY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current || !stickyRef.current) return;

            const containerTop = containerRef.current.getBoundingClientRect().top;
            const containerBottom = containerRef.current.getBoundingClientRect().bottom;

            console.log("Scroll", containerTop, containerBottom);

            if (containerTop <= 0) {
                setIsSticky(true);
                setOffsetY((-containerTop) + (topOffset || 0));
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [containerRef, topOffset]);

    return (
        <div
            ref={stickyRef}
            className={cn(isSticky ? "absolute" : "relative", className)}
            style={{
                top: isSticky ? offsetY : undefined,
            }}
        >{children}</div>
    )
}
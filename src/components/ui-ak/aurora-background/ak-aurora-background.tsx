"use client"

import "./style.css";
import {useEffect, useState} from "react";

export default function AKAuroraBackground() {
    const [ backgroundX, setBackgroundX ] = useState(0);
    const [ backgroundY, setBackgroundY ] = useState(0);

    useEffect(() => {
        setBackgroundX(Math.floor(Math.random() * 100));
        setBackgroundY(Math.floor(Math.random() * 100));
    }, []);

    return (
        <div id="aurora-container"
            className="fixed inset-0"
             style={{ backgroundPosition: `${backgroundX}% ${backgroundY}%` }}
        ></div>
    )
}
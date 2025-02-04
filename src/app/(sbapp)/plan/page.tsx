"use client"

import React from "react";
import AvailableTime from "@/components/sbapp/planning/available-time";

export default function PlanningPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="px-4 pt-4">
                <h1 className="text-3xl">Planning</h1>
            </div>
            <div className="flex-1 rounded-xl bg-muted/50 md:min-h-min p-3">
                <AvailableTime />
            </div>
        </div>
    )
}
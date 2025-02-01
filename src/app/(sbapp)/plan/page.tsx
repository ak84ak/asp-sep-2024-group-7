"use client"

export default function PlanningPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="px-4 pt-4">
                <h1 className="text-3xl">Dashboard</h1>
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-3">
                <div className="w-full h-full mx-auto flex flex-col items-center justify-center">
                    <div>
                        <p className="text-lg">Work in progress</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
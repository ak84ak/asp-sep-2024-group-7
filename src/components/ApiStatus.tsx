"use client"

import SBContext from "@/lib/contexts/sb-context";
import {useContext} from "react";
import {Spinner} from "@/components/ui-ak/spinner";

export default function ApiStatus() {
    const ctx = useContext(SBContext);

    return (
        <>
            {ctx.isClient && ctx.activeRequests > 0 ?
                <div className="fixed top-1 right-1 p-2 z-[60] text-primary bg-background">
                    <Spinner size="medium" />
                </div>
                : null
            }
        </>
    );
}
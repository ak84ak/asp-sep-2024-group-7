"use client"

import {useContext, useEffect} from "react";
import {HomeContext} from "@/app/(home)/template";

export default function TermsPage() {
    const pageContext = useContext(HomeContext);

    useEffect(() => {
        pageContext.setShowFeaturesLink(false);
    }, [ pageContext ]);

    return (
        <>
            <main className="flex flex-col gap-8 row-start-2 items-start sm:items-start self-start">
                <div className="mx-auto text-justify w-full sm:w-[70vw] text-xl">
                    <h1>Terms of Service</h1>
                </div>
            </main>
        </>
    );
}

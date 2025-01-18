"use client"

import SBContext from "@/lib/contexts/sb-context";
import {useContext, useEffect, useState} from "react";
import {SBApiContext} from "@/lib/contexts/sb-api-context";

export default function SBContextProvider({children}: { children: React.ReactNode }) {
    const apiCtx = useContext(SBApiContext);

    const [ sbState, setSbState ] = useState({
        isClient: false,
        isAuthenticated: apiCtx.api.isAuthenticated,
        activeRequests: 0
    });

    useEffect(() => {
        apiCtx.api.setRequestStatusUpdate(async (n) => {
            console.log("setRequestStatusUpdate", n);
            setSbState((prev) => ({
                ...prev,
                activeRequests: n
            }));
        });

        apiCtx.api.setAuthenticatedStatusUpdate(async (isAuthenticated) => {
            setSbState((prev) => ({
                ...prev,
                isAuthenticated: isAuthenticated
            }));
        });
    }, [apiCtx]);

    useEffect(() => {
        setSbState((prev) => {
            return {
                ...prev,
                isClient: true
            }
        });
    }, []);

    return (
        <SBApiContext value={apiCtx}>
            <SBContext.Provider value={sbState}>
                {children}
            </SBContext.Provider>
        </SBApiContext>
    );
}
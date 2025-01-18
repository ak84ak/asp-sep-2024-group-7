"use client"

import {createContext} from "react";

export interface ISBContext {
    isClient: boolean;
    isAuthenticated: boolean;
    activeRequests: number;
}

const SBContext = createContext<ISBContext>({
    isClient: false,
    isAuthenticated: false,
    activeRequests: 0
});

export default SBContext;
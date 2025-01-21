"use client"

import {createContext} from "react";
import SBApi from "@/lib/sb-api/SBApi";

export interface ISBApiContext {
    api: SBApi;
}

const api = new SBApi();

export const SBApiContext = createContext<ISBApiContext>({ api });
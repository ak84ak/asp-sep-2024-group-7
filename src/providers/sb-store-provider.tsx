'use client'

import {createContext, useCallback, useContext, useEffect, useRef} from "react";
import { type SbStore, createSbStore } from "@/stores/sb-store";
import {useStore} from "zustand";
export type SBStoreApi = ReturnType<typeof createSbStore>;

export const SBStoreContext = createContext<SBStoreApi | undefined>(undefined);

export interface ISBStoreProviderProps {
    children: React.ReactNode;
}

export const SBStoreProvider = ({ children }: ISBStoreProviderProps) => {
    const storeRef = useRef<SBStoreApi>(null);
    if (!storeRef.current) {
        storeRef.current = createSbStore();
    }

    const api = (useStore(storeRef.current, (store) => store.getApi))();
    const setIsClient = useStore(storeRef.current, (store) => store.setIsClient);
    const setApiIsAuthenticated = useStore(storeRef.current, (store) => store.setApiIsAuthenticated);
    const apiLoadCurrentUser = useStore(storeRef.current, (store) => store.apiLoadCurrentUser);
    const setApiActiveRequests = useStore(storeRef.current, (store) => store.setApiActiveRequests);

    const onAuthUpdate = useCallback(async (isAuthenticated: boolean) => {
        setApiIsAuthenticated(isAuthenticated);

        if (isAuthenticated) {
            await apiLoadCurrentUser();
        }
    }, [apiLoadCurrentUser, setApiIsAuthenticated]);

    useEffect(() => {
        // Set the client flag to ensure we're on the client side
        setIsClient(true);

        const asyncInit = async () => {
            await onAuthUpdate(api.isAuthenticated);
        }

        const onActiveRequestsUpdateUnsubscribe = api.on("activeRequestsUpdate", (n) => {
            setApiActiveRequests(n);
        });

        const onIsAuthenticatedUpdateUnsubscribe = api.on("isAuthenticatedUpdate", onAuthUpdate);

        // Start async init
        asyncInit().then(() => {});

        return () => {
            // Unsubscribe from events
            onActiveRequestsUpdateUnsubscribe();
            onIsAuthenticatedUpdateUnsubscribe();
        };
    }, [ api, onAuthUpdate, setApiActiveRequests, setIsClient ]);

    return (
        <SBStoreContext.Provider value={storeRef.current}>
            {children}
        </SBStoreContext.Provider>
    )
}

export const useSBStore = <T,>(selector: (store: SbStore) => T,): T => {
    const sbStoreContext = useContext(SBStoreContext);

    if (!sbStoreContext) {
        throw new Error("useSBStore must be used within a SBStoreProvider");
    }

    return useStore(sbStoreContext, selector);
}
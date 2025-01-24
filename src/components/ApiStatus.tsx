"use client"

import {Spinner} from "@/components/ui-ak/spinner";
import {useSBStore} from "@/providers/sb-store-provider";

export default function ApiStatus() {
    const isClient = useSBStore((store) => store.isClient);
    const apiActiveRequests = useSBStore((store) => store.apiActiveRequests);

    return (
        <>
            {isClient && apiActiveRequests > 0 ?
                <div className="fixed top-1 right-1 p-2 z-[60] text-primary bg-background">
                    <Spinner size="medium" />
                </div>
                : null
            }
        </>
    );
}
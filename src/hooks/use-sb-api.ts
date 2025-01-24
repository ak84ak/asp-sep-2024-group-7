import {useSBStore} from "@/providers/sb-store-provider";

export function useSBApi() {
    return (useSBStore((store) => store.getApi))();
}
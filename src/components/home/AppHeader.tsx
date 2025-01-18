import {Button} from "@/components/ui/button";
import {ArrowRightIcon, LogOutIcon} from "lucide-react";
import SBContext from "@/lib/contexts/sb-context";
import {useContext} from "react";
import {SBApiContext} from "@/lib/contexts/sb-api-context";

type AppHeaderProperties = {
    onLoginClick?: () => void;
}

export default function AppHeader(props: AppHeaderProperties) {
    const ctx = useContext(SBContext);
    const api = useContext(SBApiContext).api;

    const onLogoutClick = async () => {
        await api.logout();
        window.location.reload();
    }

    const onLoginClick = () => {
        if (props.onLoginClick) {
            props.onLoginClick();
        }
    }

    return (
        <header className="w-full mx-auto p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Study Buddy</span>
            </div>
            <div>
                {ctx.isAuthenticated && ctx.isClient ? (
                    <Button variant="ghost" className="cursor-pointer text-[18px] p-5"
                    onClick={ onLogoutClick }>Logout <LogOutIcon /></Button>
                ) : (
                    <Button variant="ghost" className="cursor-pointer text-[18px] p-5"
                    onClick={ onLoginClick }>Login <ArrowRightIcon /></Button>
                )}
            </div>
        </header>
    );
}
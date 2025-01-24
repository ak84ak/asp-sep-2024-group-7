import {MouseEventHandler, useState} from "react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {useSBStore} from "@/providers/sb-store-provider";

export default function AppLogin() {
    const apiLogin = useSBStore((store) => store.apiLogin);

    const router = useRouter();

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onLogin: MouseEventHandler<HTMLButtonElement> = async (e) => {
        e.preventDefault();
        setError("");
        try {
            setLoading(true);
            const res = await apiLogin(login, password);
            if (res) {
                window.location.reload();
            }
        } catch (e) {
            setError((e as { message: string }).message ?? "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const onGoToMainPage:  MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        router.push("/");
    }

    return (
        <div className="w-full h-[100vh] mx-auto flex flex-col items-center justify-center">
            <div className="max-w-72">
                <form>
                    <div className="flex flex-col gap-6 mt-4">
                        <div className="grid gap-2">
                            <Label htmlFor="login">Login or Email</Label>
                            <Input
                                id="login"
                                type="text"
                                placeholder="awesome.student@university.com"
                                required
                                value={login}
                                onChange={(e) => {
                                    setLogin(e.target.value);
                                    setError("");
                                }}
                            />
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <TooltipTrigger asChild>
                                            <a
                                                href="#"
                                                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                            >
                                                Forgot your password?
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Automatic password reset is not available at this time.<br/>
                                                Please contact support to reset your password.</p>
                                        </TooltipContent>
                                    </div>
                                    <Input id="password" type="password" required
                                           value={password}
                                           onChange={(e) => {
                                               setPassword(e.target.value);
                                               setError("");
                                           }}
                                    />
                                </div>
                            </Tooltip>
                        </TooltipProvider>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <Button type="submit" className="w-full cursor-pointer" variant="outline" onClick={onLogin}
                                disabled={loading}>
                            Login
                        </Button>
                    </div>
                    <div className="mt-4 text-center text-sm">
                        <Button variant="link" className="underline underline-offset-4 cursor-pointer"
                                onClick={onGoToMainPage}
                        >Go to main page</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
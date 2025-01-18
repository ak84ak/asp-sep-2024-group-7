"use client"

import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {MouseEventHandler, useContext, useState} from "react";
import {SBApiContext} from "@/lib/contexts/sb-api-context";

type LoginFormProperties = {
    onSignUpSwitch?: () => void;
    onLoginSuccess?: () => void;
}

export default function LoginForm(props: LoginFormProperties) {
    const sbApiCtx = useContext(SBApiContext);

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onLogin: MouseEventHandler<HTMLButtonElement> = async (e) => {
        e.preventDefault();
        setError("");
        try {
            setLoading(true);
            const res = await sbApiCtx.api.login(login, password);
            if (res) {
                if (props.onLoginSuccess) {
                    props.onLoginSuccess();
                }
            }
        } catch (e) {
            setError((e as { message: string }).message ?? "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
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
                        onChange={(e) => { setLogin(e.target.value); setError(""); }}
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
                                   onChange={(e) => { setPassword(e.target.value); setError(""); }}
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
                Don&apos;t have an account?{" "}
                <Button variant="link" className="underline underline-offset-4 cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            if (props.onSignUpSwitch) {
                                props.onSignUpSwitch();
                            }
                        }}
                >Sign up</Button>
            </div>
        </form>
    );
}
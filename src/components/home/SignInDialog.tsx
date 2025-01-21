"use client"

import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import LoginForm from "@/components/home/LoginForm";
import {useEffect, useState} from "react";
import SignUpForm from "@/components/home/SignUpForm";
import {Button} from "@/components/ui/button";

type SignInDialogProperties = {
    isOpen: boolean;
    onClose: () => void;
    tab: "login" | "signup";
}

export default function SignInDialog(props: SignInDialogProperties) {
    const [activeTab, setActiveTab] = useState<string>(props.tab);
    const [isAfterSuccessSignup, setIsAfterSuccessSignup] = useState(false);

    useEffect(() => {
        setActiveTab(props.tab);
    }, [props.tab]);

    const onSignUpSwitch = () => {
        setActiveTab("signup");
    }
    const onLoginSwitch = () => {
        setActiveTab("login");
    }

    const onOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setIsAfterSuccessSignup(false);
            props.onClose();
        }
    }

    const onLoginSuccess = () => {
        window.location.reload();
    }

    const onSignUpSuccess = () => {
        setIsAfterSuccessSignup(true);
    }

    return (
        <Dialog open={props.isOpen} defaultOpen={false} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <VisuallyHidden asChild>
                    <DialogTitle>Sign In / Sign Up Dialog</DialogTitle>
                </VisuallyHidden>
                {isAfterSuccessSignup ? (
                    <div>
                        <h1>Thank you for joining!</h1>
                        <div>You can now
                            <Button variant="link" className="underline underline-offset-4 cursor-pointer"
                                    onClick={(e) => {e.preventDefault(); setActiveTab("login"); setIsAfterSuccessSignup(false);}}
                            >Login</Button>
                            with your credentials.
                        </div>
                    </div>
                ) : (
                    <Tabs defaultValue="login" className="mt-4" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login">
                            <LoginForm onSignUpSwitch={onSignUpSwitch} onLoginSuccess={onLoginSuccess}/>
                        </TabsContent>
                        <TabsContent value="signup">
                            <SignUpForm onLoginSwitch={onLoginSwitch} onSignupSuccess={onSignUpSuccess}/>
                        </TabsContent>
                    </Tabs>
                )}
            </DialogContent>
        </Dialog>
    )
        ;
}
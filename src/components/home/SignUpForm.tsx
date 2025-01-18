import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import Link from "next/link";
import {MouseEventHandler, useContext, useState} from "react";
import UIFeatureFlags from "@/lib/ui-flags";
import {SBApiContext} from "@/lib/contexts/sb-api-context";

type SignUpFormProperties = {
    onLoginSwitch?: () => void;
    onSignupSuccess?: () => void;
}

export default function SignUpForm(props: SignUpFormProperties) {
    const sbApiCtx = useContext(SBApiContext);

    const [login, setLogin] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [invitationCode, setInvitationCode] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (!validatePasswords()) {
            return;
        }

        if (login.trim() === "") {
            setError("Login cannot be empty");
            return false;
        }

        if (login.trim().length < 3) {
            setError("Login must be at least 3 characters long");
            return false;
        }

        const emailNormalized = email?.trim() || "";

        if (emailNormalized === "") {
            setError("Email cannot be empty");
            return false;
        }

        if (!emailNormalized.includes("@") || emailNormalized.length < 3) {
            setError("Invalid email address");
            return false;
        }

        const passwordNormalized = password?.trim() || "";

        if (passwordNormalized === "") {
            setError("Password cannot be empty");
            return false;
        }

        if (passwordNormalized.length < 6) {
            setError("Password is too short");
            return false;
        }

        if (passwordConfirmation.trim() === "") {
            setError("Password confirmation cannot be empty");
            return false;
        }

        if (!/^[a-zA-Z][a-zA-Z0-9-_]+$/.test(login)) {
            setError("Login can only contain letters, digits, hyphens and underscores");
            return false;
        }

        if (!UIFeatureFlags.RegistrationEnabled) {
            setError("Registration is disabled");
            return false;
        }

        if (UIFeatureFlags.RegistrationInvitationRequired && invitationCode.trim() === "") {
            setError("Invitation code required");
            return false;
        }

        if (!termsAccepted) {
            setError("Sorry, we can't process further registration process until you accept terms and conditions");
            return false;
        }

        return true;
    }

    const onSignUp: MouseEventHandler<HTMLButtonElement> = async (e) => {
        e.preventDefault();
        setError("");
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const res = await sbApiCtx.api.registration(login, email, password, invitationCode, termsAccepted);
            if (res) {
                if (props.onSignupSuccess) {
                    props.onSignupSuccess();
                }
            }
        } catch (e) {
            setError((e as { message: string }).message ?? "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const validatePasswords = () => {
        if ((password || passwordConfirmation) && password !== passwordConfirmation) {
            setError("Passwords do not match");
            return false;
        }

        return true;
    }

    return (
        <form>
            <div className="flex flex-col gap-6 mt-4">
                <div className="grid gap-2">
                    <Label htmlFor="login">Login</Label>
                    <Input
                        id="login"
                        type="text"
                        placeholder="awesome-student"
                        required
                        value={login}
                        onChange={(e) => { setLogin(e.target.value); setError(""); }}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="awesome-student@university.com"
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required
                           value={password}
                           onChange={(e) => { setPassword(e.target.value); setError(""); }}
                           onBlur={() => validatePasswords()}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password-confirmation">Password confirmation</Label>
                    <Input id="password-confirmation" type="password" required
                           value={passwordConfirmation}
                           onChange={(e) => { setPasswordConfirmation(e.target.value); setError("");}}
                           onBlur={() => validatePasswords()}
                    />
                </div>
                { UIFeatureFlags.RegistrationInvitationRequired && (
                    <div className="grid gap-2">
                        <Label htmlFor="invitation-code">Invitation code</Label>
                        <Input id="invitation-code" type="text" required
                               value={invitationCode}
                               onChange={(e) => { setInvitationCode(e.target.value); setError("");}}
                        />
                    </div>
                )}
                <div className="flex items-center space-x-2">
                    <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(e) => { setTermsAccepted(e === true); setError(""); }}/>
                    <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Accept <Link href="/terms" className="underline underline-offset-4">Terms and Conditions</Link>
                    </label>
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <Button type="submit" className="w-full cursor-pointer" variant="outline" onClick={onSignUp}
                        disabled={loading}>
                    Sign Up
                </Button>
            </div>
            <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Button variant="link" className="underline underline-offset-4 cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            if (props.onLoginSwitch) {
                                props.onLoginSwitch();
                            }
                        }}
                >Login</Button>
            </div>
        </form>
    );
}
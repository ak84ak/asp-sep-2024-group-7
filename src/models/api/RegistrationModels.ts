export interface IRegistrationRequest {
    login: string;
    email: string;
    password: string;
    invitationCode?: string;
    termsAccepted: boolean;
}

export interface IRegistrationResponse {
    success: boolean;
    errorMessage?: string;
}
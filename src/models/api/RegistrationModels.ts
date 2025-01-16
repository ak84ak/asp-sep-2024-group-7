export interface IRegistrationRequest {
    login: string;
    email: string;
    password: string;
    invitationCode?: string;
}

export interface IRegistrationResponse {
    success: boolean;
    errorMessage?: string;
}
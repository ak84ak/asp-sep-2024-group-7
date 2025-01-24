export interface IGetCurrentUserResponse {
    user: ICurrentUser;
}

export interface ICurrentUser {
    id: string;
    login: string;
    email: string;
}
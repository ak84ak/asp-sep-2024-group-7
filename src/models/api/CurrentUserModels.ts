export interface IGetCurrentUserResponse {
    user: ICurrentUserApiModel;
}

export interface ICurrentUserApiModel {
    id: string;
    login: string;
    email: string;
}
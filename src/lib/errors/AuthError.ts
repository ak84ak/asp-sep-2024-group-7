export enum AuthErrorType {
    UserNotFound = 1,
    WrongPassword = 2,
}

export default class AuthError extends Error {
    type: AuthErrorType;

    constructor(message: string, type: AuthErrorType) {
        super(message);
        this.name = 'AuthError';
        this.type = type;
    }
}
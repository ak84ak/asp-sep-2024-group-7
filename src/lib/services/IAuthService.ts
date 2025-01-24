export default interface IAuthService {
    authenticateUser(login: string, password: string): Promise<{ token: string, validTo: Date }>;

    registerUser(login: string, password: string, email: string): Promise<{ success: boolean, errorMessage?: string }>;

    getUserFromToken(token: string): Promise<{ id: string, login: string }>;
}
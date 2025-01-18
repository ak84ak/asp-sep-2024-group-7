import axios, {AxiosInstance, AxiosResponse} from "axios";
import {ILoginRequest, ILoginResponse} from "@/models/api/LoginModels";
import {IRegistrationRequest, IRegistrationResponse} from "@/models/api/RegistrationModels";

export default class SBApi {
    private _client?: AxiosInstance;
    private _token: string | null = null;
    private _tokenValidTo: Date | null = null;

    private _activeRequests = 0;
    private _requestStatusUpdate?: (activeRequests: number) => Promise<void>;
    private _authenticatedStatusUpdate?: (isAuthenticated: boolean) => Promise<void>;

    get isAuthenticated() {
        return this._token !== null && this._token !== undefined && this._tokenValidTo !== null && this._tokenValidTo.getTime() > Date.now();
    }

    constructor() {
        if (typeof window !== 'undefined') {
            this._token = localStorage.getItem('SBToken');
            const tokenValidToS = localStorage.getItem('SBTokenExpires');
            if (tokenValidToS) {
                try {
                    this._tokenValidTo = new Date(tokenValidToS);
                } catch {
                    this._tokenValidTo = null;
                    this._token = null;
                }
            }

            this._client = axios.create({
                baseURL: "/api"
            });
        }
    }

    private async onRequestsStatusUpdate() {
        if (this._requestStatusUpdate) {
            try {
                await this._requestStatusUpdate(this._activeRequests);
            } catch {
                // Ignore
            }
        }
    }

    private async onAuthenticatedStatusUpdate() {
        if (this._authenticatedStatusUpdate) {
            try {
                await this._authenticatedStatusUpdate(this.isAuthenticated);
            } catch {
                // Ignore
            }
        }
    }

    private async increaseActiveRequests() {
        this._activeRequests++;
        await this.onRequestsStatusUpdate();
    }

    private async decreaseActiveRequests() {
        this._activeRequests--;
        await this.onRequestsStatusUpdate();
    }

    private async postWithoutAuth(url: string, data?: unknown): Promise<AxiosResponse<unknown, unknown>> {
        if (!this._client) {
            throw new Error("Client not initialized");
        }
        await this.increaseActiveRequests();
        try {
            return await this._client.post(url, data, {validateStatus: () => true});
        } finally {
            await this.decreaseActiveRequests();
        }
    }

    setRequestStatusUpdate(callback: (activeRequests: number) => Promise<void>) {
        this._requestStatusUpdate = callback;
    }

    setAuthenticatedStatusUpdate(callback: (isAuthenticated: boolean) => Promise<void>) {
        this._authenticatedStatusUpdate = callback;
    }

    async login(login: string, password: string): Promise<boolean> {
        if (!this._client) {
            return false;
        }

        try {
            const req: ILoginRequest = {
                login,
                password
            };

            const response = await this.postWithoutAuth("/users/login", req);
            if (response.status === 200) {
                const loginResponse = response.data as ILoginResponse;
                this._token = loginResponse.token;
                this._tokenValidTo = new Date(loginResponse.validTo);

                localStorage.setItem("SBToken", loginResponse.token);
                localStorage.setItem("SBTokenExpires", loginResponse.validTo);

                return true;
            } else {
                throw new Error(`Login failed: ${response.statusText}, ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            throw e;
        } finally {
            await this.onAuthenticatedStatusUpdate();
        }
    }

    async registration(login: string, email: string, password: string, invitationCode: string, termsAccepted: boolean): Promise<boolean> {
        if (!this._client) {
            return false;
        }

        try {
            const req: IRegistrationRequest = {
                login,
                email,
                password,
                invitationCode,
                termsAccepted
            };

            const response = await this.postWithoutAuth("/users/registration", req);
            if (response.status === 200) {
                const registrationResponse = response.data as IRegistrationResponse;
                if (!registrationResponse.success) {
                    throw new Error(`Registration failed: ${registrationResponse.errorMessage}`);
                }

                return true;
            } else {
                throw new Error(`Registration failed: ${response.statusText}, ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            throw e;
        } finally {
            await this.onAuthenticatedStatusUpdate();
        }
    }

    async logout(): Promise<void> {
        if (typeof window !== "undefined") {
            this._token = null;
            this._tokenValidTo = null;
            localStorage.removeItem("SBToken");
            localStorage.removeItem("SBTokenExpires");
        }
        await this.onAuthenticatedStatusUpdate();
    }
}
import axios, {AxiosInstance, AxiosResponse} from "axios";
import {ILoginRequest, ILoginResponse} from "@/models/api/LoginModels";
import {IRegistrationRequest, IRegistrationResponse} from "@/models/api/RegistrationModels";
import {createNanoEvents, Emitter} from "nanoevents";
import {ICurrentUser, IGetCurrentUserResponse} from "@/models/api/CurrentUserModels";
import {
    ICourseModule, ICourseModuleActivity,
    ICreateModuleRequest,
    ICreateModuleResponse, IDeleteModuleResponse,
    IGetPredefinedModulesResponse, IGetUserModulesResponse, IUpdateModuleRequest, IUpdateModuleResponse
} from "@/models/api/ModulesModels";
import {IBaseErrorModel} from "@/models/api/BaseApiModels";
import {
    ICreateActivityRequest,
    ICreateActivityResponse,
    IDeleteActivityResponse,
    IImportCourseraActivitiesRequest,
    IImportCourseraActivitiesResponse,
    IUpdateActivityRequest,
    IUpdateActivityResponse
} from "@/models/api/ActivitiesModels";
import {ModuleActivityType} from "@/models/shared/ModuleActivityType";
import {ICourseraMappedActivity} from "@/models/parsing/CourseraModels";
import {IGetUserAvailableTimeResponse, IUserAvailableTime} from "@/models/api/UserAvailableTimeModels";
import testData from "@/lib/sb-api/test-data";

export interface ISBEvents {
    activeRequestsUpdate: (activeRequests: number) => void;
    isAuthenticatedUpdate: (isAuthenticated: boolean) => void;
}

// TODO: ADD AUTOMATED TOKEN RENEW

export default class SBApi {
    private _client?: AxiosInstance;
    private _token: string | null = null;
    private _tokenValidTo: Date | null = null;

    private _activeRequests = 0;
    private _isAuthenticated = false;

    private _emitter: Emitter;

    get isAuthenticated() {
        return this._isAuthenticated;
    }

    constructor() {
        this._emitter = createNanoEvents<ISBEvents>();
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

            this._isAuthenticated = this._token !== null && this._token !== undefined && this._tokenValidTo !== null && this._tokenValidTo.getTime() > Date.now();

            this._client = axios.create({
                baseURL: "/api"
            });
        }
    }

    private async onRequestsStatusUpdate() {
        try {
            this._emitter.emit("activeRequestsUpdate", this._activeRequests);
        } catch {
            // Ignore
        }
    }

    private updateIsAuthenticatedStatus(newStatus: boolean) {
        try {
            if (newStatus != this._isAuthenticated) {
                this._isAuthenticated = newStatus;
                this._emitter.emit("isAuthenticatedUpdate", this.isAuthenticated);
            }
        } catch {
            // Ignore
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

    private async get(url: string): Promise<AxiosResponse<unknown, unknown>> {
        if (!this._client) {
            throw new Error("Client not initialized");
        }

        await this.increaseActiveRequests();
        try {
            return await this._client.get(url, {
                validateStatus: () => true,
                headers: {Authorization: `Bearer ${this._token}`}
            });
        } finally {
            await this.decreaseActiveRequests();
        }
    }

    private async post(url: string, data?: unknown): Promise<AxiosResponse<unknown, unknown>> {
        if (!this._client) {
            throw new Error("Client not initialized");
        }

        await this.increaseActiveRequests();
        try {
            return await this._client.post(url, data, {
                validateStatus: () => true,
                headers: {Authorization: `Bearer ${this._token}`}
            });
        } finally {
            await this.decreaseActiveRequests();
        }
    }

    private async put(url: string, data?: unknown): Promise<AxiosResponse<unknown, unknown>> {
        if (!this._client) {
            throw new Error("Client not initialized");
        }

        await this.increaseActiveRequests();
        try {
            return await this._client.put(url, data, {
                validateStatus: () => true,
                headers: {Authorization: `Bearer ${this._token}`}
            });
        } finally {
            await this.decreaseActiveRequests();
        }
    }

    private async delete(url: string): Promise<AxiosResponse<unknown, unknown>> {
        if (!this._client) {
            throw new Error("Client not initialized");
        }

        await this.increaseActiveRequests();
        try {
            return await this._client.delete(url, {
                validateStatus: () => true,
                headers: {Authorization: `Bearer ${this._token}`}
            });
        } finally {
            await this.decreaseActiveRequests();
        }
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

                this.updateIsAuthenticatedStatus(true);
                return true;
            } else {
                this.updateIsAuthenticatedStatus(false);
                throw new Error(`Login failed: ${response.statusText}, ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            console.error(e);
            this.updateIsAuthenticatedStatus(false);
            throw e;
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
            console.error(e);
            throw e;
        }
    }

    async logout(): Promise<void> {
        if (typeof window !== "undefined") {
            this._token = null;
            this._tokenValidTo = null;
            localStorage.removeItem("SBToken");
            localStorage.removeItem("SBTokenExpires");
        }
        this.updateIsAuthenticatedStatus(false);
    }

    async getCurrentUser(): Promise<ICurrentUser | null> {
        if (!this._client) {
            return null;
        }

        if (!this._isAuthenticated) {
            return null;
        }

        try {
            const response = await this.post("/users/me", {});
            if (response.status === 200) {
                const res = response.data as IGetCurrentUserResponse;
                if (!res.user) {
                    throw new Error("No user returned");
                }
                return res.user;
            } else {
                throw new Error(`Get current user failed: ${response.statusText}, ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getPredefinedModules(universityId: string): Promise<ICourseModule[] | null> {
        if (!this._client) {
            return null;
        }

        if (!this._isAuthenticated) {
            return null;
        }

        try {
            const response = await this.get("/modules/predefined?universityId=" + universityId);
            if (response.status === 200) {
                const res = response.data as IGetPredefinedModulesResponse;
                if (!res.modules) {
                    throw new Error("No modules returned");
                }
                return res.modules;
            } else {
                throw new Error(`Get predefined modules failed: ${response.statusText}, ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getUserModules(): Promise<ICourseModule[] | null> {
        if (!this._client) {
            return null;
        }

        if (!this._isAuthenticated) {
            return null;
        }

        try {
            const response = await this.get("/modules/user");
            if (response.status === 200) {
                const res = response.data as IGetUserModulesResponse;
                if (!res.modules) {
                    throw new Error("No modules returned");
                }
                return res.modules;
            } else {
                throw new Error(`Get user modules failed: ${response.statusText}, ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async createModule(name: string, code: string, weeks: number, universityId: string, activities: ICourseModuleActivity[]): Promise<boolean> {
        if (!this._client) {
            return false;
        }

        try {
            const req: ICreateModuleRequest = {
                name,
                code,
                totalWeeks: weeks,
                universityId,
                activities
            };

            const response = await this.post("/modules", req);
            if (response.status === 200) {
                const createModuleResponse = response.data as ICreateModuleResponse;
                if ((createModuleResponse as unknown as IBaseErrorModel).error) {
                    const errorResponse = createModuleResponse as unknown as IBaseErrorModel;
                    throw new Error(`Module creation failed: ${errorResponse.error}`);
                }

                return true;
            } else {
                throw new Error(`Module creation failed: ${response.statusText}, ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async createActivity(
        moduleId: string,
        week: number,
        name: string,
        isCompleted: boolean,
        completionDate: Date | undefined,
        duration: number,
        type: ModuleActivityType): Promise<boolean> {

        if (!this._client) {
            return false;
        }

        try {
            const req: ICreateActivityRequest = {
                week,
                name,
                isCompleted,
                completionDate,
                duration,
                type
            };

            const response = await this.post(`/modules/${moduleId}/activities`, req);
            if (response.status === 200) {
                const createActivityResponse = response.data as ICreateActivityResponse;
                if ((createActivityResponse as unknown as IBaseErrorModel).error) {
                    const errorResponse = createActivityResponse as unknown as IBaseErrorModel;
                    throw new Error(`Activity creation failed: ${errorResponse.error}`);
                }

                return true;
            } else {
                throw new Error(`Activity creation failed: ${response.statusText}, ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async importCourseraActivities(
        moduleId: string,
        week: number,
        activities: ICourseraMappedActivity[]): Promise<boolean>
    {
        if (!this._client) {
            return false;
        }

        try {
            const req: IImportCourseraActivitiesRequest = {
                week,
                activities
            };

            const response = await this.post(`/modules/${moduleId}/import-coursera`, req);
            if (response.status === 200) {
                const importCourseraResponse = response.data as IImportCourseraActivitiesResponse;
                if ((importCourseraResponse as unknown as IBaseErrorModel).error) {
                    const errorResponse = importCourseraResponse as unknown as IBaseErrorModel;
                    throw new Error(`Activity import failed: ${errorResponse.error}`);
                }

                return true;
            } else {
                throw new Error(`Activity import failed: ${response.statusText}, ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async updateModule(moduleId: string, updateModuleRequest: {
        isNameUpdated: boolean,
        newName?: string,
        isCodeUpdated: boolean,
        newCode?: string,
        isTotalWeeksUpdated: boolean,
        newTotalWeeks?: number,
    }): Promise<boolean>
    {
        if (!this._client) {
            return false;
        }

        try {
            const req: IUpdateModuleRequest = updateModuleRequest;

            const response = await this.put(`/modules/${moduleId}`, req);
            if (response.status === 200) {
                const updateModuleResponse = response.data as IUpdateModuleResponse;
                if ((updateModuleResponse as unknown as IBaseErrorModel).error) {
                    const errorResponse = updateModuleResponse as unknown as IBaseErrorModel;
                    throw new Error(`Module update failed: ${errorResponse.error}`);
                }

                return true;
            } else {
                throw new Error(`Module update failed: ${response.statusText}, ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async deleteModule(moduleId: string): Promise<boolean> {
        if (!this._client) {
            return false;
        }

        try {
            const response = await this.delete(`/modules/${moduleId}`);
            if (response.status === 200) {
                const deleteModuleResponse = response.data as IDeleteModuleResponse;
                if ((deleteModuleResponse as unknown as IBaseErrorModel).error) {
                    const errorResponse = deleteModuleResponse as unknown as IBaseErrorModel;
                    throw new Error(`Module delete failed: ${errorResponse.error}`);
                }

                return true;
            } else {
                throw new Error(`Module delete failed: ${response.statusText}, ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async updateActivity(moduleId: string, activityId: string, updateActivityRequest: {
        isNameUpdated: boolean,
        newName?: string,
        isCompletedUpdated: boolean,
        newIsCompleted?: boolean,
        isCompletionDateUpdated: boolean,
        newCompletionDate?: Date | undefined,
        isDurationUpdated: boolean,
        newDuration?: number,
        isTypeUpdated: boolean,
        newType?: ModuleActivityType,
        isOrderUpdated: boolean,
        newOrder?: number,
    }): Promise<boolean>
    {
        if (!this._client) {
            return false;
        }

        try {
            const req: IUpdateActivityRequest = updateActivityRequest;

            const response = await this.put(`/modules/${moduleId}/activities/${activityId}`, req);
            if (response.status === 200) {
                const updateActivityResponse = response.data as IUpdateActivityResponse;
                if ((updateActivityResponse as unknown as IBaseErrorModel).error) {
                    const errorResponse = updateActivityResponse as unknown as IBaseErrorModel;
                    throw new Error(`Activity update failed: ${errorResponse.error}`);
                }

                return true;
            } else {
                throw new Error(`Activity update failed: ${response.statusText}, ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async deleteActivity(moduleId: string, activityId: string): Promise<boolean> {
        if (!this._client) {
            return false;
        }

        try {
            const response = await this.delete(`/modules/${moduleId}/activities/${activityId}`);
            if (response.status === 200) {
                const deleteActivityResponse = response.data as IDeleteActivityResponse;
                if ((deleteActivityResponse as unknown as IBaseErrorModel).error) {
                    const errorResponse = deleteActivityResponse as unknown as IBaseErrorModel;
                    throw new Error(`Activity delete failed: ${errorResponse.error}`);
                }

                return true;
            } else {
                throw new Error(`Activity delete failed: ${response.statusText}, ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async getUserAvailableTime(): Promise<IUserAvailableTime | null> {
        if (!this._client) {
            return null;
        }

        if (!this._isAuthenticated) {
            return null;
        }

        try {
            const response = await this.get("/user/available-time");
            if (response.status === 200) {
                const res = response.data as IGetUserAvailableTimeResponse;
                if (!res.availableTime) {
                    throw new Error("No data returned");
                }
                return res.availableTime;
            } else if (response.status === 404 && testData.availableTime) {
                return testData.availableTime;
            } else {
                throw new Error(`Get user modules failed: ${response.statusText}, ${JSON.stringify(response.data)}`);
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }


    on<E extends keyof ISBEvents>(event: E, callback: ISBEvents[E]) {
        return this._emitter.on(event, callback)
    }
}
import {createStore} from "zustand/vanilla";
import {devtools} from "zustand/middleware";
import SBApi from "@/lib/sb-api/SBApi";
import {ModuleActivityType} from "@/models/shared/ModuleActivityType";
import {ICourseraMappedActivity} from "@/models/parsing/CourseraModels";
import {IUserAvailableTime} from "@/models/api/UserAvailableTimeModels";
import {ICurrentUser} from "@/models/domain/UserModels";
import {ICourseModule, ICourseModuleActivity} from "@/models/domain/ModulesModels";

export type SBState = {
    // General state
    isClient: boolean;

    // API Stats
    apiActiveRequests: number;

    // API
    apiIsAuthenticated: boolean;

    // User
    user?: ICurrentUser;

    // Modules
    modules: ICourseModule[] | undefined;

    // Modules page
    modulesPageSelectedModule?: ICourseModule;
    modulesPageSelectedActivity?: ICourseModuleActivity;

    // Planning
    availableTime: IUserAvailableTime | undefined;
}

export type SBActions = {
    // General state actions
    setIsClient: (isClient: boolean) => void;

    // Modules page
    setModulesPageSelectedModule: (module: ICourseModule) => void;
    setModulesPageSelectedActivity: (activity: ICourseModuleActivity) => void;

    // API Stats actions
    setApiIsAuthenticated: (isAuthenticated: boolean) => void;
    setApiActiveRequests: (activeRequests: number) => void;

    // API actions
    getApi: () => SBApi;

    apiLogin: (login: string, password: string) => Promise<boolean>;
    apiLogout: () => Promise<void>;
    apiRegistration: (login: string, email: string, password: string, invitationCode: string, termsAccepted: boolean) => Promise<boolean>;
    apiLoadCurrentUser: () => Promise<ICurrentUser | null>;

    apiLoadModules: (forceReload: boolean) => Promise<ICourseModule[] | undefined>;
    apiCreateModule: (name: string, code: string, totalWeeks: number, startDate: Date, universityId: string, activities: ICourseModuleActivity[]) => Promise<boolean>;
    apiCreateActivity: (
        moduleId: string,
        week: number,
        name: string,
        isCompleted: boolean,
        completionDate: Date | undefined,
        duration: number,
        type: ModuleActivityType,
        deadline: Date | undefined) => Promise<boolean>;
    apiUpdateModule: (moduleId: string, updateModuleRequest: {
        isNameUpdated: boolean,
        newName?: string,
        isCodeUpdated: boolean,
        newCode?: string,
        isTotalWeeksUpdated: boolean,
        newTotalWeeks?: number,
        isStartDateUpdated: boolean,
        newStartDate?: Date | undefined,
    }) => Promise<boolean>;
    apiDeleteModule: (moduleId: string) => Promise<boolean>;

    apiUpdateActivity: (moduleId: string, activityId: string, updateActivityRequest: {
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
        isDeadlineUpdated: boolean,
        newDeadline?: Date | undefined
    }) => Promise<boolean>;
    apiDeleteActivity: (moduleId: string, activityId: string) => Promise<boolean>;

    apiImportCourseraActivities: (moduleId: string, week: number, activities: ICourseraMappedActivity[]) => Promise<boolean>;

    apiLoadAvailableTime: () => Promise<void>;
}

export type SbStore = SBState & SBActions;

export const defaultInitState: SBState = {
    isClient: false,
    apiIsAuthenticated: false,
    apiActiveRequests: 0,
    user: undefined,

    modules: undefined,
    availableTime: undefined,
}

export const createSbStore = (initState: SBState = defaultInitState) => {
    console.log("CreateSbStore called");

    const api = new SBApi();

    return createStore<SbStore>()(
        devtools<SbStore>(
            (set, get) => ({
                ...initState,

                setIsClient: (isClient: boolean) => set(
                    () => ({isClient: isClient}), undefined, "setIsClient"),

                setModulesPageSelectedModule: (module: ICourseModule) => {
                    set(() => ({
                        modulesPageSelectedModule: module,
                        modulesPageSelectedActivity: undefined
                    }), undefined, "setModulesPageSelectedModule");
                },
                setModulesPageSelectedActivity: (activity: ICourseModuleActivity) => {
                    set(() => ({
                        modulesPageSelectedModule: undefined,
                        modulesPageSelectedActivity: activity
                    }), undefined, "setModulesPageSelectedActivity");
                },

                setApiIsAuthenticated: (isAuthenticated: boolean) => {
                    if (isAuthenticated) {
                        set(() => ({apiIsAuthenticated: isAuthenticated}), undefined, "setApiIsAuthenticated");
                    } else {
                        set(() => ({
                            apiIsAuthenticated: isAuthenticated,
                            user: undefined
                        }), undefined, "setApiIsAuthenticated");
                    }
                },
                setApiActiveRequests: (activeRequests: number) => set(
                    () => ({apiActiveRequests: activeRequests}), undefined, "setApiActiveRequests"),

                getApi: () => api,

                apiLogin: async (login: string, password: string) => {
                    return api.login(login, password);
                },
                apiLogout: async () => {
                    set(() => ({apiIsAuthenticated: false, user: undefined}), undefined, "apiLogout");
                    await api.logout();
                },
                apiRegistration: async (login: string, email: string, password: string, invitationCode: string, termsAccepted: boolean) => {
                    return api.registration(login, email, password, invitationCode, termsAccepted);
                },
                apiLoadCurrentUser: async () => {
                    const user = await api.getCurrentUser();
                    set(() => ({user: user ?? undefined}), undefined, "apiLoadCurrentUser");
                    return user;
                },

                apiLoadModules: async (forceReload: boolean) => {
                    if (!forceReload) {
                        const modules = get().modules;
                        if (modules) {
                            return modules;
                        }
                    }

                    const modules: ICourseModule[] | null = await api.getUserModules();
                    if (!modules) {
                        set(() => ({modules: undefined}), undefined, `apiLoadModules(${forceReload ? "Force" : "Cached"})`);
                        return undefined;
                    }
                    set(() => ({modules: modules}), undefined, `apiLoadModules(${forceReload ? "Force" : "Cached"})`);

                    const prevModulesPageSelectedModule = get().modulesPageSelectedModule;
                    const prevModulesPageSelectedActivity = get().modulesPageSelectedModule;

                    if (prevModulesPageSelectedModule) {
                        const newSelectedModule = modules.find(m => m.id === prevModulesPageSelectedModule.id);
                        if (newSelectedModule) {
                            set(() => ({
                                modulesPageSelectedModule: newSelectedModule,
                                modulesPageSelectedActivity: undefined
                            }), undefined, "apiLoadModules");
                        } else {
                            set(() => ({
                                modulesPageSelectedModule: undefined,
                                modulesPageSelectedActivity: undefined
                            }), undefined, "apiLoadModules");
                        }
                    } else if (prevModulesPageSelectedActivity) {
                        const activityModule = modules.find(m => m.activities.find(a => a.id === prevModulesPageSelectedActivity.id));
                        if (activityModule) {
                            const newSelectedActivity = activityModule.activities.find(a => a.id === prevModulesPageSelectedActivity.id);
                            if (newSelectedActivity) {
                                set(() => ({
                                    modulesPageSelectedModule: undefined,
                                    modulesPageSelectedActivity: newSelectedActivity
                                }), undefined, "apiLoadModules");
                            } else {
                                set(() => ({
                                    modulesPageSelectedModule: undefined,
                                    modulesPageSelectedActivity: undefined
                                }), undefined, "apiLoadModules");
                            }
                        } else {
                            set(() => ({
                                modulesPageSelectedModule: undefined,
                                modulesPageSelectedActivity: undefined
                            }), undefined, "apiLoadModules");
                        }
                    }

                    return modules;
                },
                apiCreateModule: async (name: string, code: string, totalWeeks: number, startDate: Date, universityId: string, activities: ICourseModuleActivity[]) => {
                    const res = await api.createModule(name, code, totalWeeks, startDate, universityId, activities);
                    if (res) {
                        // Force reload modules
                        await get().apiLoadModules(true);
                    }
                    return res;
                },
                apiCreateActivity: async (
                    moduleId: string,
                    week: number,
                    name: string,
                    isCompleted: boolean,
                    completionDate: Date | undefined,
                    duration: number,
                    type: ModuleActivityType,
                    deadline: Date | undefined) => {
                    const res = await api.createActivity(moduleId, week, name, isCompleted, completionDate, duration, type, deadline);
                    if (res) {
                        // Force reload modules
                        await get().apiLoadModules(true);
                    }
                    return res;
                },
                apiUpdateModule: async (moduleId: string, updateModuleRequest: {
                    isNameUpdated: boolean,
                    newName?: string,
                    isCodeUpdated: boolean,
                    newCode?: string,
                    isTotalWeeksUpdated: boolean,
                    newTotalWeeks?: number,
                    isStartDateUpdated: boolean,
                    newStartDate?: Date | undefined,
                }): Promise<boolean> => {
                    const res = await api.updateModule(moduleId, updateModuleRequest);
                    if (res) {
                        // Force reload modules
                        await get().apiLoadModules(true);
                    }
                    return res;
                },
                apiDeleteModule: async (moduleId: string): Promise<boolean> => {
                    const res = await api.deleteModule(moduleId);
                    if (res) {
                        // Force reload modules
                        set(() => ({
                            modulesPageSelectedModule: undefined,
                            modulesPageSelectedActivity: undefined
                        }), undefined, "apiDeleteModule");
                        await get().apiLoadModules(true);
                    }
                    return res;
                },

                apiUpdateActivity: async (moduleId: string, activityId: string, updateActivityRequest: {
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
                    isDeadlineUpdated: boolean,
                    newDeadline?: Date | undefined
                }): Promise<boolean> => {
                    const res = await api.updateActivity(moduleId, activityId, updateActivityRequest);
                    if (res) {
                        // Force reload modules
                        await get().apiLoadModules(true);
                    }
                    return res;
                },
                apiDeleteActivity: async (moduleId: string, activityId: string): Promise<boolean> => {
                    const res = await api.deleteActivity(moduleId, activityId);
                    if (res) {
                        // Force reload modules
                        set(() => ({
                            modulesPageSelectedActivity: undefined
                        }), undefined, "apiDeleteActivity");
                        await get().apiLoadModules(true);
                    }
                    return res;
                },
                apiImportCourseraActivities: async (moduleId: string, week: number, activities: ICourseraMappedActivity[]): Promise<boolean> => {
                    const res = await api.importCourseraActivities(moduleId, week, activities);
                    if (res) {
                        // Force reload modules
                        await get().apiLoadModules(true);
                    }
                    return res;
                },
                apiLoadAvailableTime: async () => {
                    const availableTime = await api.getUserAvailableTime();
                    set(() => ({availableTime: availableTime ?? undefined}), undefined, "apiLoadAvailableTime");
                }
            })));
}
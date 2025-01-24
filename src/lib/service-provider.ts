import MongoUserRepository from "@/lib/data-access/MongoUserRepository";
import AuthService from "@/lib/services/AuthService";
import {IUserRepository} from "@/lib/data-access/IUserRepository";
import SbInitService from "@/lib/services/SbInitService";
import MongoModuleRepository from "@/lib/data-access/MongoModuleRepository";

export type SBService = "UserRepository" | "AuthService" | "SbInitService" | "ModuleRepository";

type SBServiceDescriptor = {
    name: string;
    resolver: (provider: ServiceProvider) => Promise<unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IResolvable { }

export default class ServiceProvider {
    private _services: Map<SBService, SBServiceDescriptor> = new Map<SBService, SBServiceDescriptor>();

    constructor() {
        this._services.set("UserRepository", {
            name: "UserRepository",
            resolver: async () => {
                const result = new MongoUserRepository();
                await result.init();
                return result;
            }
        });

        this._services.set("AuthService", {
            name: "AuthService",
            resolver: async (provider) => {
                const userRepository = await provider.resolve<IUserRepository>("UserRepository");
                const result = new AuthService(userRepository);
                return result;
            }
        });

        this._services.set("SbInitService", {
            name: "SbInitService",
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            resolver: async (provider) => {
                const result = new SbInitService();
                return result;
            }
        });

        this._services.set("ModuleRepository", {
            name: "ModuleRepository",
            resolver: async () => {
                const result = new MongoModuleRepository();
                return result;
            }
        });
    }

    async resolve<Type extends IResolvable>(service: SBService) : Promise<Type> {
        const descriptor = this._services.get(service);
        if (descriptor === undefined) {
            throw new Error(`Service ${service} is not registered`);
        }
        return (await descriptor.resolver(this)) as Type;
    }

    dispose() {
        this._services.clear();
    }
}

const provider = new ServiceProvider();

export function GetServiceProvider(): ServiceProvider {
    return provider;
}

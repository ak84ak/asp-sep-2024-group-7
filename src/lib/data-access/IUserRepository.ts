import {IResolvable} from "@/lib/service-provider";
import IDbUserDto from "@/models/db/IDbUserDto";

export interface IUserRepository extends IResolvable {
    ping(): Promise<void>;
    getUserByLoginOrEmail(loginOrEmail: string): Promise<IDbUserDto | null>;
    getUserById(id: string): Promise<IDbUserDto | null>;
    createUser(operator: string, login: string, email: string, ph: string): Promise<IDbUserDto | null>;
}
import {IBaseEntityDto} from "@/models/db/IBaseEntityDto";

export default interface IDbUserDto extends IBaseEntityDto{
    login: string;
    loginKey: string;
    email: string;
    ph: string;
}
export default interface IDbUserDto {
    id: string;
    createdOn: Date;
    createdBy: string;
    updatedOn: Date;
    updatedBy: string;

    login: string;
    loginKey: string;
    email: string;
    ph: string;
}
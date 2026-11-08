export interface IAdminAuthLogin {
    email: string;
    password: string;
}

export interface IAdminAuthRegister {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    roleId: string;
}

export interface IAdminAuthUpdate {
    name?: string;
    avatar?: string;
    roleId?: string;
}
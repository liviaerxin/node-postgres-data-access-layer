export interface UserBase {
    // data contract
    name: string;
    email: string;
    role: Role;
}

export interface UserCreate extends UserBase {
    password: string;
}

export interface UserUpdate extends Omit<UserBase, 'name' | 'email' | 'role' | 'password'> {
    id: number;
    name?: string;
    email?: string;
    role?: Role;
    password?: string;
}

export interface UserRead extends UserBase {
    id: number;
    createdAt: Date;
    updatedAt: Date;
}

/* User with complete attributes with a row from a table in Database, a.k.a DbUser */
export interface User extends UserBase {
    id: number;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum Role {
    Admin = 'admin',
    Maintainer = 'maintainer',
    User = 'user',
}

export class UserDto {
    id: string;
    full_name: string;
    email: string;
    password: string;
    phone_number?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

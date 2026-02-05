export interface User {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: UserRole;
}

export enum UserRole {
  USER = "USER",
  USER_ADMIN = "ADMIN",
}

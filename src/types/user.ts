export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
}

export interface User {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  phone: string | null;
  role: UserRole;
}

export interface UserAdmin {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  account: {
    id: string;
    username: string;
    email: string;
  };
}

export interface CreateUserAdminDto {
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
}

export interface UpdateUserAdminDto {
  name: string;
  email: string;
  username: string;
  phone: string;
}

export interface UserAdminListParams {
  page: number;
  limit: number;
}

export interface UserAdminListResponse {
  data: UserAdmin[];
  total: number;
}

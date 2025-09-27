export interface Employee {
  id: string;
  userId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  branchId: string | null;
  departmentId: string | null;
  fullName: string;
  accountId: string | null;
  phone: string | null;
  avatar: string | null;
  currentLevel: number;
}

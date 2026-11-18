
export type Employee = {
  _id: string;
  name: string;
  email: string;
  department: string;
  salary: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeSortField =
  | "name"
  | "email"
  | "department"
  | "salary"
  | "createdAt";

export type SortOrder = "asc" | "desc";

export type EmployeeQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  sortBy?: EmployeeSortField;
  sortOrder?: SortOrder;
};

export type EmployeeListResponse = {
  success: boolean;
  data: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type EmployeeResponse = {
  success: boolean;
  data: Employee;
};

export type EmployeeInput = {
  name: string;
  email: string;
  department: string;
  salary: number;
};

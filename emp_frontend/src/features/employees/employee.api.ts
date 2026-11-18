import { baseApi } from "@/lib/baseApi";
import type {
  Employee,
  EmployeeInput,
  EmployeeListResponse,
  EmployeeQueryParams,
  EmployeeResponse,
} from "@/types/employee";

export const employeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<
      EmployeeListResponse,
      EmployeeQueryParams
    >({
      query: (params) => ({
        url: "/employees",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Employee" as const,
                id: _id,
              })),
              { type: "Employee" as const, id: "LIST" },
            ]
          : [{ type: "Employee" as const, id: "LIST" }],
    }),

    getEmployeeById: builder.query<Employee, string>({
      query: (id) => `/employees/${id}`,
      transformResponse: (response: EmployeeResponse) => response.data,
      providesTags: (_result, _error, id) => [
        { type: "Employee", id },
      ],
    }),

    createEmployee: builder.mutation<Employee, EmployeeInput>({
      query: (employee) => ({
        url: "/employees",
        method: "POST",
        body: employee,
      }),
      transformResponse: (response: EmployeeResponse) => response.data,
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),

    updateEmployee: builder.mutation<
      Employee,
      { id: string; data: Partial<EmployeeInput> }
    >({
      query: ({ id, data }) => ({
        url: `/employees/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: EmployeeResponse) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
    }),

    deleteEmployee: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
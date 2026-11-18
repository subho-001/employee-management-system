import { baseApi } from "@/lib/baseApi";
import type {
  AuthUser,
  LoginInput,
  LoginResponse,
  CurrentUserResponse,
} from "@/types/auth";

export const authApi = baseApi.injectEndpoints({
  
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginInput>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    getCurrentUser: builder.query<AuthUser, void>({
      query: () => "/auth/me",
      transformResponse: (response: CurrentUserResponse) =>
        response.data.user,
      providesTags: ["Auth"],
    }),

    logout: builder.mutation<
      { success: boolean; message: string },
      void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;
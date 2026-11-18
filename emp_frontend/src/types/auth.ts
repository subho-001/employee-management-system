
export type UserRole = "admin" | "viewer";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
};


export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    tokenType: "Bearer";
    expiresIn: string;
    user: AuthUser;
  };
};

export type CurrentUserResponse = {
  success: boolean;
  data: {
    user: AuthUser;
  };
};

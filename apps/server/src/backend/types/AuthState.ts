import User from "~/backend/types/User";

type AuthState = {
  logged: false
} | {
  logged: true,
  user: User
};

export default AuthState;
export default interface AuthUser {
  id: string;
  name: string;
  email: string;
  authProvider?: string;
}
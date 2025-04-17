export default interface UserModel {
    email: string;
    role: "user" | "admin";
    status: "pending" | "active";
}
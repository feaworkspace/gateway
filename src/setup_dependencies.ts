// @ts-nocheck
// Imports
import { Dependencies } from "tydi"; 
import HttpServer from "./HttpServer";
import App from "./backend/App";
import AuthController from "./backend/controllers/AuthController";
import CollaborationController from "./backend/controllers/CollaborationController";
import FrontendController from "./backend/controllers/FrontendController";
import ProfileController from "./backend/controllers/ProfileController";
import AuthMiddleware from "./backend/middlewares/AuthMiddleware";
import ProxyMiddleware from "./backend/middlewares/ProxyMiddleware";
import AuthService from "./backend/services/AuthService";
import CollaborationService from "./backend/services/CollaborationService";
import JwtService from "./backend/services/JwtService";
import UserService from "./backend/services/UserService";
import UserRepository from "./backend/model/user/UserRepository";

// DependencyManager
const dependencies_0 = new Dependencies();

// Dependencies
const app_3 = new App();
const httpServer_2 = new HttpServer(app_3);
const jwtService_24 = new JwtService();
const userRepository_27 = new UserRepository();
const userService_26 = new UserService(userRepository_27);
const authService_21 = new AuthService(jwtService_24, userService_26);
const authController_6 = new AuthController(app_3, authService_21);
const collaborationService_23 = new CollaborationService(jwtService_24);
const collaborationController_10 = new CollaborationController(app_3, collaborationService_23, jwtService_24);
const frontendController_12 = new FrontendController(app_3);
const profileController_14 = new ProfileController(app_3);
const authMiddleware_16 = new AuthMiddleware(app_3);
const proxyMiddleware_18 = new ProxyMiddleware(app_3);

// Lazy injects

// Register dependencies in DependencyManager
dependencies_0.register("Dependencies", dependencies_0);
dependencies_0.register("HttpServer", httpServer_2);
dependencies_0.register("App", app_3);
dependencies_0.register("AuthController", authController_6);
dependencies_0.register("CollaborationController", collaborationController_10);
dependencies_0.register("FrontendController", frontendController_12);
dependencies_0.register("ProfileController", profileController_14);
dependencies_0.register("AuthMiddleware", authMiddleware_16);
dependencies_0.register("ProxyMiddleware", proxyMiddleware_18);
dependencies_0.register("AuthService", authService_21);
dependencies_0.register("CollaborationService", collaborationService_23);
dependencies_0.register("JwtService", jwtService_24);
dependencies_0.register("UserService", userService_26);
dependencies_0.register("UserRepository", userRepository_27);

// Run @Startup methods
app_3.init();
authMiddleware_16.init();
proxyMiddleware_18.init();
httpServer_2.init();
authController_6.init();
collaborationController_10.init();
frontendController_12.init();
profileController_14.init();
collaborationService_23.init();
userRepository_27.init();

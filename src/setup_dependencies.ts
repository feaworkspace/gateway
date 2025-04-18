// @ts-nocheck
// Imports
import { Dependencies } from "tydi"; 
import HttpServer from "./HttpServer";
import App from "./backend/App";
import AuthController from "./backend/controllers/AuthController";
import CollaborationController from "./backend/controllers/CollaborationController";
import FrontendController from "./backend/controllers/FrontendController";
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
const jwtService_21 = new JwtService();
const authService_18 = new AuthService(jwtService_21);
const authController_6 = new AuthController(app_3, authService_18);
const collaborationService_20 = new CollaborationService(jwtService_21);
const collaborationController_10 = new CollaborationController(app_3, collaborationService_20, jwtService_21);
const frontendController_12 = new FrontendController(app_3);
const authMiddleware_14 = new AuthMiddleware(app_3);
const proxyMiddleware_16 = new ProxyMiddleware(app_3);
const userRepository_24 = new UserRepository();
const userService_23 = new UserService(userRepository_24);

// Lazy injects

// Register dependencies in DependencyManager
dependencies_0.register("Dependencies", dependencies_0);
dependencies_0.register("HttpServer", httpServer_2);
dependencies_0.register("App", app_3);
dependencies_0.register("AuthController", authController_6);
dependencies_0.register("CollaborationController", collaborationController_10);
dependencies_0.register("FrontendController", frontendController_12);
dependencies_0.register("AuthMiddleware", authMiddleware_14);
dependencies_0.register("ProxyMiddleware", proxyMiddleware_16);
dependencies_0.register("AuthService", authService_18);
dependencies_0.register("CollaborationService", collaborationService_20);
dependencies_0.register("JwtService", jwtService_21);
dependencies_0.register("UserService", userService_23);
dependencies_0.register("UserRepository", userRepository_24);

// Run @Startup methods
app_3.init();
authMiddleware_14.init();
proxyMiddleware_16.init();
httpServer_2.init();
authController_6.init();
collaborationController_10.init();
frontendController_12.init();
collaborationService_20.init();

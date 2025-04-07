import {createMiddleware} from "@solidjs/start/middleware";
import type {FetchEvent} from "@solidjs/start/server";
import handleAuthentication from "~/backend/middleware/handleAuthentication";
import handleRoutes from "./handleRoutes";

export default createMiddleware({
  onRequest: (event: FetchEvent) => {
    const res = handleAuthentication(event);
    if(res) return res;
    const res2 = handleRoutes(event);
    if(res2) return res2;
  }
});
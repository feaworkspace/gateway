import {createMiddleware} from "@solidjs/start/middleware";
import type {FetchEvent} from "@solidjs/start/server";
import handleAuthentication from "~/backend/middleware/handleAuthentication";

export default createMiddleware({
  onRequest: (event: FetchEvent) => {
    const res = handleAuthentication(event);
    if(res) return res;
  }
});
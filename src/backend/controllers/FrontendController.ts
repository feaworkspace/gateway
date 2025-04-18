import App from "../App";
import * as fs from "fs";
import * as path from "path";
import { getUser } from "../utils/getUser";
import * as Settings from "../Settings";
import { Singleton, Startup } from "tydi";
import fullUrl from "../utils/fullUrl";

@Singleton
export default class FrontendController {
    public constructor(private readonly app: App) {

    }

    @Startup
    public init() {
        fs.readdirSync(path.join(__dirname, '..', '..', 'frontend', 'views')).forEach(file => {
            const fileName = file.substring(0, file.indexOf("."));
            const path = "/" + (fileName === "index" ? "" : fileName);
            this.app.express.get(path, async function (req, res) {
                const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
                const url = fullUrl(req);
                const user = await getUser(req);
                if(path === "/" && !user) {
                    res.redirect(protocol + "://" + Settings.HOSTNAME + "/login?redirect=" + encodeURIComponent(url));
                    return;
                }
                res.render(fileName, { user, settings: Settings });
            });
        });
    }
}
import App from "../App";
import * as fs from "fs";
import * as path from "path";
import { getUser } from "../utils/getUser";
import * as Settings from "../Settings";
import { Singleton, Startup } from "tydi";

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
                res.render(fileName, { user: await getUser(req), settings: Settings });
            });
        });
    }
}
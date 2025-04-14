import 'dotenv/config';
import './services/FirebaseAdmin';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import logger from 'morgan';
import auth from './middlewares/auth';
import proxy from './middlewares/proxy';
import AuthService from './services/AuthService';
import { PARENT_HOSTNAME, TOKEN_NAME } from './Settings';
import * as fs from 'fs';
import * as Settings from './Settings';
import { octClient } from './oct/OctClient';
import { credentialsManager } from './oct/CredentialsManager';
import OctRoomInstance from './oct/OctRoomInstance';
import { getUser } from './utils/getUser';
import cors from 'cors';

var app = express();
// app.engine('html', ejs.renderFile);
app.set('views', path.join(__dirname, '..', 'frontend', 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev') as any);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser() as any);
app.use(express.static(path.join(__dirname, '..', 'frontend', 'static')));

app.use(auth());
app.use(proxy());

// FRONTEND

fs.readdirSync(path.join(__dirname, '..', 'frontend', 'views')).forEach(file => {
    const fileName = file.substring(0, file.indexOf("."));
    const path = "/" + (fileName === "index" ? "" : fileName);
    app.get(path, async function (req, res) {
        res.render(fileName, { user: await getUser(req), settings: Settings });
    });
});


// API

app.post('/api/auth', async function (req, res) {
    const existingUser = await getUser(req);
    if (existingUser) {
        res.json({ logged: true, user: existingUser });
        return;
    }

    try {
        const { token: firebaseToken, userData } = req.body;

        const { user, token } = await AuthService.get().registerUser(firebaseToken, userData);

        // Set the cookie
        res.cookie(TOKEN_NAME, token, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            domain: !Settings.IS_LOCALHOST && "." + PARENT_HOSTNAME
        });

        res.json(user);
    } catch (e) {
        console.error("Error", e);
        res.status(500).json({ logged: false, error: "Error" });
    }
});

octClient.onReady = async () => {
    console.log("[OCT] Ready");

    const user1Token = await credentialsManager.generateUserJwt({
        id: "user1",
        name: "User 1",
        authProvider: "system",
        email: "user1@workspace.com"
    });

    console.log("[OCT] User 1 JWT", user1Token);

    const user2Token = await credentialsManager.generateUserJwt({
        id: "user2",
        name: "User 2",
        authProvider: "system",
        email: "user1@workspace.com"
    });

    console.log("[OCT] User 2 JWT", user2Token);

    try {
        await octClient.createRoom();
        console.log("[OCT] Room created");
    } catch (e) {
        console.error("[OCT] Error creating room", e);
    }
}

export default app;

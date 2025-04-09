import 'dotenv/config';
import './services/FirebaseAdmin';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import logger from 'morgan';
import * as ejs from 'ejs';
import auth from './middlewares/auth';
import proxy from './middlewares/proxy';
import AuthService from './services/AuthService';
import { PARENT_HOSTNAME, TOKEN_NAME } from './Settings';

var app = express();
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.use(logger('dev') as any);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser() as any);
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use(auth());
app.use(proxy());

// FRONTEND

app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

// API

app.post('/api/auth', async function (req, res) {
    console.log("Auth request", req.body);

    const existingUser = AuthService.get().getUserForRequest(req);
    if (existingUser) {
        res.json({ logged: true, user: existingUser });
        return;
    }

    try {
        const firebaseToken = req.body.token;

        const { user, token } = await AuthService.get().registerUser(firebaseToken);

        // Set the cookie
        res.cookie(TOKEN_NAME, token, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            domain: "." + PARENT_HOSTNAME
        });

        res.json(user);

    } catch (e) {
        console.error("Error", e);
        res.status(500).json({ logged: false, error: "Error" });
    }
});


export default app;

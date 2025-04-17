import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import logger from 'morgan';
import * as Settings from './Settings';
import cors from 'cors';
import "./model/user/UserRepository";
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { Priority, Singleton, Startup } from "tydi";

const firebase = initializeApp({
    credential: applicationDefault()
});


@Singleton
export default class App {
    public readonly express = express();

    public constructor() { }


    @Startup
    @Priority(1000)
    public init() {
        const app = this.express;

        app.use(cors(function (req, callback) {
            var corsOptions;
            if (Settings.CORS_ALLOWED_ORIGINS.indexOf(req.header('Origin')) !== -1) {
              corsOptions = { origin: true, credentials: true };
            } else {
              corsOptions = { origin: false } ;
            }
            callback(null, corsOptions);
          }));
          
          app.set('views', path.join(__dirname, '..', 'frontend', 'views'));
          app.set('view engine', 'ejs');
          app.use(logger('dev') as any);
          app.use(express.json());
          app.use(express.urlencoded({ extended: false }));
          app.use(cookieParser() as any);
          app.use(express.static(path.join(__dirname, '..', 'frontend', 'static')));
    }
}

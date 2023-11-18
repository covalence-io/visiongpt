import { Router, Request, Response, NextFunction } from 'express';
import ai from './ai';
import users from './user';

export default function api() {
    const router = Router();

    router
        .use((req, res, next) => {
            if (!req.body) {
                next(new Error('Bad request'));
                return;
            }

            next();
        })
        .use('/v1', apiV1())
        .use((req, res, next) => {
            res.json({
                error: 'Invalid route',
            });
        });

    return router;
}

function apiV1() {
    const router = Router();

    router
        .use((req, res, next) => {
            console.log('API V1');
            next();
        })
        .use('/ai', ai())
        .use('/users', users())
        .use((error: any, req: Request, res: Response, next: NextFunction) => {
            res.status(error.status).json({
                error: error.message,
            });
        });

    return router;
}
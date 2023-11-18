import { Router } from 'express';
import { OpenAI } from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

export default function ai() {
    const router = Router();

    router
        .post('/', async (req, res, next) => {
            const body = req.body;

            if (!body.prompt) {
                return next({
                    status: 400,
                    message: 'Prompt needed to continue',
                });
            }

            try {
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4-vision-preview',
                    messages: body.prompt,
                    temperature: 0.6,
                    max_tokens: 1000,
                });

                res.json(completion);
            } catch (e) {
                return next({
                    status: 500,
                    message: (e as any).data,
                });
            }
        });

    return router;
}
import dotenv from 'dotenv';
dotenv.config();

export const key = process.env.API_KEY;
export const port = process.env.PORT;
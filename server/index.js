import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './mongodb/connect.js';
import userRouter from './Routes/user.routes.js';
import adminRouter from './Routes/admin.routes.js';
import ownerRouter from './Routes/owner.routes.js'
import { app,server } from './socket/socket.js';

dotenv.config();

import { notfound, errorHandler } from './middleware/errorMiddleware.js';


app.use(cors({
    origin: process.env.USER_BASE_URl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/owner',ownerRouter);


app.use(notfound);
app.use(errorHandler);


connectDB(process.env.MONGODB_URL);
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`))

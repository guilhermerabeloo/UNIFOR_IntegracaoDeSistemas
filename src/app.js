import dotenv from "dotenv";
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import connectDB from "../config/mongoDb.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(cors());

routes(app);

export default app;
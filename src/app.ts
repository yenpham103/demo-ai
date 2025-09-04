import express from 'express';
import dotenv from 'dotenv';
import helmet from "helmet";
import compression from 'compression';
import routes from './routes';

dotenv.config();

const app = express();

app.use(helmet()); // Bảo vệ các thông tin header quan trọng
app.use(compression()); // Giảm kích thước dữ liệu truyền tải
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', routes);

export default app;

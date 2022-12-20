import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import ProductRoutes from './Routes/product.routes.js';

dotenv.config({ path: './config.env' });

const app = express();
app.use(express.json());
// app.use(helmet());
app.use(cors());

// routes
app.use('/products', ProductRoutes);

app.use('/Uploads', express.static('Uploads'));

app.listen(process.env.PORT || 5000, () => {
  mongoose.connect(process.env.MONGO_DB).then(() => {
    console.log('connected');
  });
});

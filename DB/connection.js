import mongoose from 'mongoose';

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log('connected'))
  .catch(() => console.log('connection failed'));

export default mongoose;

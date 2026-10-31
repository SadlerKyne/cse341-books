import 'dotenv/config';
import app from './app.js';
import { connectToDb } from './src/db/connect.js';

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectToDb();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

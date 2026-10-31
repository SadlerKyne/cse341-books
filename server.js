import 'dotenv/config';
import app from './app.js';

const port = process.env.PORT || 3000;

const startServer = async () => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

startServer();

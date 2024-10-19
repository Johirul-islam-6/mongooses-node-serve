// /* eslint-disable no-console */
import mongoose from 'mongoose';
import config from './config';
import app from './app';
// import { errorLogger, } from './shared/logger';
import { Server } from 'http';
// import { logger } from './shared/logger';

// synchronous error handel
process.on('uncaughtException', error => {
  console.log(error);
  process.exit(1);
});

let server: Server;

// database connected
async function DataBase() {
  try {
    await mongoose.connect(config.databaser_url as string);
    console.log('📚 Database connected | All Ok');
    server = app.listen(config.port, () => {
      console.log(`Run Time listening on port ${config.port}`);
    });
  } catch (error) {
    console.log(`Database Connected fail ::`, error);
  }
  // When
  process.on('unhandledRejection', error => {
    console.log(error);

    if (server) {
      server.close(() => {
        console.log(error);
      });
    } else {
      process.exit(1);
    }
  });
}

DataBase();

// when server stops suddenly off notification call
process.on('SIGTERM', () => {
  console.log('SIGTERM is Resive');
  if (server) {
    server.close();
  }
});

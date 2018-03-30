import { Request } from 'express';
import * as mongoose from 'mongoose';
import * as uuid from 'uuid';
import { LogLevel } from './api';

// Handles database interaction
export default class DB {
  private config = require('./config.json');
  private log: (level: LogLevel, message: string, req?: Request, err?: Error) => void;

  constructor(log: (level: LogLevel, message: string, req?: Request, err?: Error) => void) {
    this.log = log;
  }

  // Connects to the database
  public connect(): Promise<void> {
    const options: mongoose.ConnectionOptions = {
      connectTimeoutMS: this.config.db.connTimeout,
      keepAlive: 1,
      pass: this.config.db.password || process.env.XBROWSERSYNC_DB_PWD,
      user: this.config.db.username || process.env.XBROWSERSYNC_DB_USER
    };

    return new Promise((resolve, reject) => {
      mongoose.connect(`mongodb://${this.config.db.host}/${this.config.db.name}`, options);
      const db = mongoose.connection;

      db.on('error', (err: mongoose.Error) => {
        this.log(LogLevel.Error, 'Uncaught exception occurred in database', null, err);
        reject(err);
      });

      db.once('open', resolve);
    });
  }
}
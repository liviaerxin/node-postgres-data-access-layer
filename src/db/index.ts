import { Client, Pool } from 'pg';

export const getClient = (): Client => {
    return new Client({
        user: 'postgres', // default process.env.PGUSER || process.env.USER
        password: '123456', //default process.env.PGPASSWORD
        host: '127.0.0.1', // default process.env.PGHOST
        database: 'db', // default process.env.PGDATABASE || user
        port: 5432, // default process.env.PGPORT
    });
};

export const pool = new Pool({
    user: 'postgres', // default process.env.PGUSER || process.env.USER
    password: '123456', //default process.env.PGPASSWORD
    host: '127.0.0.1', // default process.env.PGHOST
    database: 'db', // default process.env.PGDATABASE || user
    port: 5432, // default process.env.PGPORT
    max: 5, // maximum number of clients the pool should contain
});

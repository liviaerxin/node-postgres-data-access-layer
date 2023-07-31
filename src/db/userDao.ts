import { Client, Pool, QueryResult } from 'pg';
import { User, UserCreate, UserUpdate } from '../model/User';

/*
    Database preparation:
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR (255) UNIQUE NOT NULL,
        email VARCHAR (255) UNIQUE NOT NULL,
        password VARCHAR (255) NOT NULL,
        role VARCHAR (255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
*/

export const TABLE_NAME = 'users';

export const findAll = async (pool: Pool | Client): Promise<User[]> => {
    const query = {
        text: `SELECT * FROM ${TABLE_NAME} ORDER BY id;`,
        values: [],
    };

    const res = await pool.query(query);
    const users = mapUserResult(res);

    return users;
};

export const findAllBy = async (
    pool: Pool | Client,
    offset: number,
    limit: number,
    filterObject?: object,
): Promise<{ items: User[]; total_count: number }> => {
    let whereSql = '';
    let values = [];
    if (filterObject) {
        const columns = Object.keys(filterObject);
        values = Object.values(filterObject);
        whereSql = 'WHERE';
        for (let i = 0; i < columns.length; i++) {
            whereSql += ` ${columns[i]} ILIKE $${i + 3} AND`;
        }

        // Remove the trailing ` AND`
        whereSql = whereSql.slice(0, -4);
    }

    const query = {
        text: `
        SELECT *, count(*) OVER() AS total_count
        FROM   ${TABLE_NAME}
        ${whereSql}
        ORDER  BY id
        OFFSET $1
        LIMIT  $2;`,
        values: [offset, limit, ...values],
    };

    const res = await pool.query(query);
    const users = mapUserResult(res);

    let total_count = 0;
    if (res.rowCount > 0) {
        total_count = parseInt(res.rows[0].total_count);
    }
    return { items: users, total_count: total_count };
};

export const findById = async (pool: Pool | Client, id: number): Promise<User | null> => {
    const query = {
        text: `SELECT * FROM ${TABLE_NAME} WHERE id = $1;`,
        values: [id],
    };

    const res = await pool.query(query);
    const users = mapUserResult(res);

    if (users.length == 0) {
        return null;
    } else if (users.length == 1) {
        return users[0];
    } else {
        throw new Error('duplicate users');
    }
};

export const findByEmail = async (pool: Pool | Client, email: string): Promise<User | null> => {
    const query = {
        text: `SELECT * FROM ${TABLE_NAME} WHERE email = $1;`,
        values: [email],
    };

    const res = await pool.query(query);
    const users = mapUserResult(res);

    if (users.length == 0) {
        return null;
    } else if (users.length == 1) {
        return users[0];
    } else {
        throw new Error('duplicate users');
    }
};

export const findByName = async (pool: Pool | Client, name: string): Promise<User | null> => {
    const query = {
        text: `SELECT * FROM ${TABLE_NAME} WHERE name = $1;`,
        values: [name],
    };

    const res = await pool.query(query);
    const users = mapUserResult(res);

    if (users.length == 0) {
        return null;
    } else if (users.length == 1) {
        return users[0];
    } else {
        throw new Error('duplicate users');
    }
};

export const add = async (pool: Pool | Client, user: UserCreate): Promise<User> => {
    const query = {
        text: `INSERT INTO ${TABLE_NAME}(name, email, password, role) VALUES($1, $2, $3, $4) RETURNING *;`,
        values: [user.name, user.email, user.password, user.role],
    };

    try {
        const res = await pool.query(query);
        const users = mapUserResult(res);
        if (users.length == 1) {
            return users[0];
        } else {
            throw new Error('add user error');
        }
    } catch (e) {
        throw new Error((e as Error).message);
    }
};

export const update = async (pool: Pool | Client, user: UserUpdate): Promise<User> => {
    const query = getUpdateQuery(TABLE_NAME, user);
    try {
        const res = await pool.query(query);
        const users = mapUserResult(res);
        if (users.length == 1) {
            return users[0];
        } else {
            throw new Error('update user error');
        }
    } catch (e) {
        throw new Error((e as Error).message);
    }
};

export const deleteById = async (pool: Pool | Client, userId: number): Promise<User> => {
    const query = {
        text: `
            DELETE FROM ${TABLE_NAME} 
            WHERE id=$1
            RETURNING *;`,
        values: [userId],
    };

    const res = await pool.query(query);
    const users = mapUserResult(res);

    if (users.length == 1) {
        return users[0];
    } else {
        throw new Error('delete user error');
    }
};

export const getUpdateQuery = (
    table: string,
    dataObject: {
        [key: string]: any;
    } & {
        id: number;
    },
): { text: string; values: any[] } => {
    if (!dataObject.hasOwnProperty('id')) {
        throw new Error('Update data should have `id` property!');
    }

    const { id, ...data } = dataObject;

    const columns = Object.keys(data);
    let updateString = `UPDATE ${table} SET`;

    for (let i = 0; i < columns.length; i++) {
        updateString += ` ${columns[i]}=$${i + 1},`;
    }

    // Remove the trailing comma
    updateString = updateString.slice(0, -1) + ` WHERE id=$${columns.length + 1} RETURNING *;`;

    return {
        text: updateString,
        values: [...Object.values(data), id],
    };
};

const mapUserResult = (
    res: QueryResult,
): User[] => // projection
    res.rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        password: r.password,
        role: r.role,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    }));

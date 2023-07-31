'use strict';

import Sinon from 'sinon';
import { after, before, beforeEach, afterEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { Client, Pool } from 'pg';

import * as UserDao from '../src/db/userDao';
import { UserCreate, Role, UserUpdate } from '../src/model/User';

describe('User Dao Test', () => {
    let client: Client;
    let pool: Pool;
    let stubTable: Sinon.SinonStub;

    before(async () => {
        client = new Client({
            user: 'postgres', // default process.env.PGUSER || process.env.USER
            password: '123456', //default process.env.PGPASSWORD
            host: '127.0.0.1', // default process.env.PGHOST
            database: 'db', // default process.env.PGDATABASE || user
            port: 5432, // default process.env.PGPORT
        });
        await client.connect();

        pool = new Pool({
            user: 'postgres', // default process.env.PGUSER || process.env.USER
            password: '123456', //default process.env.PGPASSWORD
            host: '127.0.0.1', // default process.env.PGHOST
            database: 'db', // default process.env.PGDATABASE || user
            port: 5432, // default process.env.PGPORT
            max: 5, // maximum number of clients the pool should contain
        });
    });

    after(async () => {
        await client.end();
        await pool.end();
    });

    beforeEach(async () => {
        await client.query('DROP TABLE IF EXISTS tmp_users');
        await client.query(`
            CREATE TABLE tmp_users (
                id serial PRIMARY KEY,
                name varchar(255) NOT NULL,
                email varchar(255) NOT NULL,
                password varchar(255) NOT NULL,
                role varchar(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        stubTable = Sinon.stub(UserDao, 'TABLE_NAME').value('tmp_users');
    });

    afterEach(async () => {
        client.query('DROP TABLE IF EXISTS tmp_users');
        stubTable.restore();
    });

    it('should create a new user', async () => {
        // NOTE: Dont use `pool` if we create temporary table to test which has limitations, like `CREATE TEMP TABLE users`
        const pool = client;
        const user: UserCreate = {
            name: 'user1',
            email: 'user1@example.com',
            password: 'secret',
            role: Role.Admin,
        };

        const createdUser = await UserDao.add(client, user);

        expect(createdUser).to.include(user);

        const readUser = await UserDao.findByName(pool, user.name);

        expect(readUser).to.not.be.null;
        expect(readUser).to.include(user);
    });

    it('should delete an existed user', async () => {
        // NOTE: Dont use `pool` because we create temporary table to test which has limitations
        const pool = client;
        const user: UserCreate = {
            name: 'user1',
            email: 'user1@example.com',
            password: 'secret',
            role: Role.Admin,
        };

        const createdUser = await UserDao.add(pool, user);

        expect(createdUser).to.include(user);

        const readUser = await UserDao.findByName(pool, user.name);

        expect(readUser).to.not.be.null;
        expect(readUser).to.include(user);

        // Test delete user
        await UserDao.deleteById(pool, readUser!.id);

        const readDeletedUser = await UserDao.findByName(pool, user.name);

        expect(readDeletedUser).to.be.null;
    });

    it('should throw error when delete a not exited user', async () => {
        // NOTE: Dont use `pool` because we create temporary table to test which has limitations
        const pool = client;
        const user: UserCreate = {
            name: 'user1',
            email: 'user1@example.com',
            password: 'secret',
            role: Role.Admin,
        };

        const createdUser = await UserDao.add(pool, user);

        expect(createdUser).to.include(user);

        const readUser = await UserDao.findByName(pool, user.name);

        expect(readUser).to.not.be.null;
        expect(readUser).to.include(user);

        // Test delete user
        try {
            await UserDao.deleteById(pool, 200);
        } catch (e) {
            expect(e).to.be.instanceOf(Error);
            expect((e as Error).message).to.equal('delete user error');
        }
    });

    it('should find all users', async () => {
        // NOTE: Dont use `pool` because we create temporary table to test which has limitations
        const pool = client;

        let user: UserCreate = {
            name: 'user1',
            email: 'user1@example.com',
            password: 'secret',
            role: Role.Admin,
        };
        await UserDao.add(pool, user);

        user = {
            name: 'user2',
            email: 'user2@example.com',
            password: 'secret',
            role: Role.User,
        };
        await UserDao.add(pool, user);

        user = {
            name: 'user3',
            email: 'user3@example.com',
            password: 'secret',
            role: Role.Maintainer,
        };
        await UserDao.add(pool, user);

        // Test find all users
        const users = await UserDao.findAll(pool);

        expect(users).to.be.an('array');
        expect(users).to.have.length(3);
    });

    it('should find all users in pagination and filter', async () => {
        // NOTE: Dont use `pool` because we create temporary table to test which has limitations
        const pool = client;

        // Seed data
        for (let i = 0; i < 100; i++) {
            const user: UserCreate = {
                name: `user${i}`,
                email: `user${i}@example.com`,
                password: 'secret',
                role: Role.User,
            };
            UserDao.add(pool, user);
        }

        // Test find all users
        let { items: users, total_count } = await UserDao.findAllBy(pool, 10, 20, {});

        expect(users).to.be.an;
        expect(users).to.have.length(20);
        expect(total_count).to.be.equal(100);

        let { items: users1, total_count: total_count1 } = await UserDao.findAllBy(pool, 0, 20, { name: '%user1%' });

        expect(users1).to.be.an('array');
        expect(users1).to.have.length(11);
        expect(total_count1).to.be.equal(11);

        let { items: users2, total_count: total_count2 } = await UserDao.findAllBy(pool, 0, 20, { name: 'user1' });

        expect(users2).to.have.length(1);
        expect(total_count2).to.be.equal(1);
    });

    it('should update only user name', async () => {
        // NOTE: Dont use `pool` because we create temporary table to test which has limitations
        const pool = client;
        const user: UserCreate = {
            name: 'user1',
            email: 'user1@example.com',
            password: 'secret',
            role: Role.Admin,
        };

        const createdUser = await UserDao.add(pool, user);

        expect(createdUser).to.include(user);

        const readUser = await UserDao.findByName(pool, user.name);

        expect(readUser).to.not.be.null;
        expect(readUser).to.include(user);

        // Test update only `name`
        const dataUpdate = {
            id: readUser!.id,
            name: 'user11',
        };

        const updatedUser = await UserDao.update(pool, dataUpdate);
        const readUpdatedUser = await UserDao.findById(pool, dataUpdate.id);

        expect(updatedUser).to.deep.equal(readUpdatedUser);
        expect(updatedUser).to.include(dataUpdate);
    });

    it('should update only user name, email, role', async () => {
        // NOTE: Dont use `pool` because we create temporary table to test which has limitations
        const pool = client;
        const user: UserCreate = {
            name: 'user1',
            email: 'user1@example.com',
            password: 'secret',
            role: Role.Admin,
        };

        const createdUser = await UserDao.add(pool, user);

        expect(createdUser).to.include(user);

        const readUser = await UserDao.findByName(pool, user.name);

        expect(readUser).to.not.be.null;
        expect(readUser).to.include(user);

        // Test update only `name`
        const dataUpdate: UserUpdate = {
            id: readUser!.id,
            name: 'user2',
            email: 'user2@example.com',
            role: Role.User,
        };

        const updatedUser = await UserDao.update(pool, dataUpdate);
        const readUpdatedUser = await UserDao.findById(pool, dataUpdate.id);

        expect(updatedUser).to.deep.equal(readUpdatedUser);
        expect(updatedUser).to.include(dataUpdate);
        expect(updatedUser.password).to.include(user.password);
    });

    it('should build a update sql string from full user', async () => {
        const user = {
            id: 1,
            name: 'user11',
            email: 'user11@example.com',
            password: 'secret11',
            role: 'User',
        };
        const table = 'users';
        const updateSql = UserDao.getUpdateQuery(table, user);

        expect(updateSql.text).to.equal(
            `UPDATE ${table} SET name=$1, email=$2, password=$3, role=$4 WHERE id=$5 RETURNING *;`,
        );
        expect(updateSql.values).to.be.an('array');
        expect(updateSql.values).to.deep.equal([user.name, user.email, user.password, user.role, user.id]);
    });

    it('should build a update sql string from part user', async () => {
        const user = {
            id: 1,
            name: 'user11',
        };
        const table = 'users';
        const updateSql = UserDao.getUpdateQuery(table, user);

        expect(updateSql.text).to.equal(`UPDATE ${table} SET name=$1 WHERE id=$2 RETURNING *;`);
        expect(updateSql.values).to.be.an('array');
        expect(updateSql.values).to.deep.equal([user.name, user.id]);
    });
});

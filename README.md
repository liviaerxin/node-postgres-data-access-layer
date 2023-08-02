# Data Access Layer in Node.js with PostgreSQL

The repo will build a simply **Data Access Layer** from scratch, using only [node-postgresql](https://github.com/brianc/node-postgres). To attain a comprehensive understanding, you can go deep into popular **ORM** libraries such [TypeORM](https://github.com/typeorm/typeorm)

The **Data Access Layer**(DAL), a.k.a. Data Access Object(DAO) in Java development environment, is a very important part of any application, which provides simplified access to data stored in a persistent storage like relational database. It is often sits between business logic layer(BLL) and the external database, and abstract executed **SQL** statement(**SELECT**, **UPDATE**, **INSERT**, **DELETE**) into simple functions like **readUser()** and **addUser()**.

For the data transfer between DAL and database, an in-memory object in **DAL** (in terms of object-oriented programming) complete with its attributes will correspond with a row of fields from a database **table**.

There are two patterns to implement the DAL: **Active Record** and **Data Mapper** patterns, most **ORM** tools follow these two, especially the later.

This demo will choose **Data Mapper** pattern, and have modern niceties:

- TypeScript in whole.
- Tests using **mocha** and **chaia**, and integrating a PostgreSQL database.
- Tests in CI/CD.

Let's get started!

The following example code is in [GitHub - liviaerxin/node-postgres-data-access-layer](https://github.com/liviaerxin/node-postgres-data-access-layer).

## Project Structure

```sh
./
├── src
│   ├── db
│   │   ├── index.ts
│   │   └── userDao.ts
│   └── model
│       └── User.ts
├── test
│   ├── test.ts
│   └── userDao.ts
├── package.json
└── tsconfig.json
```

## Starting the Project

1. Initialize the Node.js project

```sh
npx gitignore node
npm init
```

It will generate the `package.json` file.

2. Initialize the TypeScript

```sh
npx tsc --init
```

It will generate the `tsconfig.json` file.

## Test

In local, start a database in first. Using Docker is absolutely convenient and fast.

Here the `docker-compose.yml` file is ready to use, just run,

```sh
docker compose up
```

Then run tests,

```sh
npm run test
```

> NOTE: Due to **mocha** doesn't run TypeScript directly, the test should be able to run after compiling `*.ts` to generate `*.js` by running `tsc && mocha dist/test`. Alternatively, the test can run without generating `*.js` files in such `dist` folder by running `mocha --require ts-node/register dist/test` which is required to install `ts-node` package.

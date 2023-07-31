# Data Access Layer in Node.js with PostgreSQL

The repo will build a simply **Data Access Layer** from scratch, using only [node-postgresql](https://github.com/brianc/node-postgres). To attain a comprehensive understanding, you can go deep into popular **ORM** libraries such [TypeORM](https://github.com/typeorm/typeorm)

The **Data Access Layer**(DAL), a.k.a. Data Access Object(DAO) in Java development environment, is a very important part of any application, which provides simplified access to data stored in a persistent storage like relational database. It is often sits between business logic layer(BLL) and the external database, and abstract executed **SQL** statement(**SELECT**, **UPDATE**, **INSERT**, **DELETE**) into simple functions like **readUser()** and **addUser()**.

For the data transfer between DAL and database, an in-memory object in **DAL** (in terms of object-oriented programming) complete with its attributes will correspond with a row of fields from a database **table**.

There are two patterns to implement the DAL: **Active Record** and **Data Mapper** patterns, most **ORM** tools follow these two, especially the later.

This demo will choose **Data Mapper** pattern, and have modern niceties:

- TypeScript.
- Unit tests with a PostgreSQL database.

Let's get started!

## Project Structure


## Starting the Project

Initialize the Node.js project

```sh
npx gitignore node
npm init
```

It will generate the ``

Initialize the TypeScript

```sh
npx tsc --init
```

It will generate the `tsconfig.json` file.
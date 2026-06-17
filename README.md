# React Native SQLite ORM

A lightweight SQLite ORM for React Native with support for:

- Models
- Associations
- Query builders
- Nested includes
- Aliases
- Migrations
- Seeders
- Aggregate functions
- React context integration

Built on top of Expo SQLite with a Sequelize-inspired API.

---

# Features

- Simple model definitions
- SQLite query abstraction
- Associations (`belongsTo`, `hasMany`, `belongsToMany`)
- Nested eager loading
- Aliased joins
- Aggregate functions
- Migrations & seeders
- React Native friendly
- Expo SQLite support

---

# Installation

## Install from GitHub

```bash
npm install https://github.com/JohnOuzounis/React-Native-SQLite.git
```

or add it manually to your `package.json`

```json
{
    "dependencies": {
        "react-native-sqlite": "git+https://github.com/JohnOuzounis/React-Native-SQLite.git"
    }
}
```

---

# Prerequisites

- React Native application
- Expo SQLite

Install Expo SQLite:

```bash
npx expo install expo-sqlite
```

---

# Getting Started

## Create SQLite Instance

```javascript
import { createSqlite } from 'react-native-sqlite';

const sqlite = createSqlite();

(async () => {
    await sqlite.connect('my_database.db');
})();
```

---

# Defining Models

Models represent SQLite tables.

## Basic Example

```javascript
const User = sqlite.define('User', {
    id: {
        type: sqlite.datatypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    username: {
        type: sqlite.datatypes.STRING,
        unique: true,
        allowNull: false,
    },

    email: {
        type: sqlite.datatypes.STRING,
        unique: true,
        allowNull: false,
    },

    password: {
        type: sqlite.datatypes.STRING,
        allowNull: false,
    },
});
```

---

# Model Options

| Option       | Description                               |
| ------------ | ----------------------------------------- |
| `timestamps` | Adds `createdAt` and `updatedAt`          |
| `localtime`  | Uses local timezone instead of UTC        |
| `paranoid`   | Adds soft delete support with `deletedAt` |

Example:

```javascript
sqlite.define('User', attributes, {
    timestamps: true,
    paranoid: true,
});
```

---

# Available Data Types

| Data Type |
| --------- |
| `UUID`    |
| `STRING`  |
| `INTEGER` |
| `FLOAT`   |
| `BOOLEAN` |
| `DATE`    |
| `TEXT`    |

---

# Enum / Check Constraints

```javascript
sqlite.define('Orders', {
    status: {
        type: sqlite.datatypes.STRING,
        check: ['WAITING', 'COMPLETE'],
    },
});
```

---

# Associations

Associations define relationships between models.

---

## belongsTo

```javascript
Post.belongsTo('User', {
    foreignKey: {
        name: 'userId',
    },
});
```

### Options

| Option       | Description        |
| ------------ | ------------------ |
| `foreignKey` | Foreign key column |
| `as`         | Association alias  |

---

## belongsToMany

```javascript
User.belongsToMany('Role', {
    through: 'UserRoles',
    foreignKey: 'userId',
    otherKey: 'roleId',
});
```

### Options

| Option       | Description              |
| ------------ | ------------------------ |
| `through`    | Junction table           |
| `foreignKey` | Source model foreign key |
| `otherKey`   | Target model foreign key |

---

# Synchronizing Models

```javascript
await sqlite.sync();
```

Creates all tables and relationships automatically.

---

# DbProvider

Use `DbProvider` to access the database anywhere in your React tree.

---

## Setup

```javascript
import { DbProvider } from 'react-native-sqlite/context/DbProvider';

const createDatabase = async () => {
    const sqlite = createSqlite();

    await sqlite.connect('my_database.db');

    const User = sqlite.define('User', {});
    const Post = sqlite.define('Post', {});

    Post.belongsTo('User', {
        foreignKey: 'userId',
    });

    await sqlite.sync();

    return sqlite;
};

const App = () => (
    <DbProvider createDatabase={createDatabase} fallback={<Loading />}>
        <YourApp />
    </DbProvider>
);
```

---

## useDb Hook

```javascript
import { useDb } from 'react-native-sqlite/context/DbProvider';

const Users = () => {
    const sqlite = useDb();

    return null;
};
```

> `useDb` must be used inside `DbProvider`.

---

# CRUD Operations

---

## Create

```javascript
await sqlite.models.User.create({
    username: 'john',
    email: 'john@example.com',
});
```

### Bulk Create

```javascript
await sqlite.models.User.bulkCreate([
    {
        username: 'john',
    },
    {
        username: 'jane',
    },
]);
```

---

## Read

```javascript
await sqlite.models.User.findAll();

await sqlite.models.User.findOne({
    where: {
        id: 1,
    },
});

await sqlite.models.User.findByPk(1);
```

---

## Update

```javascript
await sqlite.models.User.update(
    {
        email: 'new@email.com',
    },
    {
        where: {
            id: 1,
        },
    },
);
```

---

## Upsert

```javascript
await sqlite.models.User.upsert({
    id: 1,
    username: 'john',
});
```

---

## Delete

```javascript
await sqlite.models.User.destroy({
    where: {
        id: 1,
    },
});
```

---

## Drop Table

```javascript
await sqlite.models.User.drop();
```

---

# Query Options

| Option       | Description       |
| ------------ | ----------------- |
| `where`      | Query conditions  |
| `attributes` | Selected columns  |
| `include`    | Join associations |
| `order`      | Sorting           |
| `group`      | Group results     |
| `limit`      | Maximum rows      |
| `offset`     | Pagination offset |

---

# Attributes

```javascript
await sqlite.models.User.findOne({
    attributes: ['username', ['phone', 'mobile']],
});
```

Generated SQL:

```sql
SELECT
    username,
    phone AS mobile
FROM User;
```

---

# Include Queries

The `include` option allows eager loading of associated models.

---

## Basic Include

```javascript
await sqlite.models.Orders.findAll({
    attributes: [['Orders.id', 'id'], 'total'],

    include: [
        {
            model: 'Customers',

            attributes: [['Customers.id', 'customerId'], 'name'],
        },
    ],
});
```

---

# Aliases (`as`)

Aliases are supported in joins and nested includes.

---

## Define Alias

```javascript
Post.belongsTo('User', {
    foreignKey: {
        name: 'authorId',
    },

    as: 'author',
});
```

---

## Query with Alias

```javascript
await sqlite.models.Post.findAll({
    include: [
        {
            model: 'User',

            as: 'author',

            attributes: [
                ['author.id', 'authorId'],
                ['author.username', 'authorUsername'],
            ],
        },
    ],
});
```

---

# Nested Includes

```javascript
await sqlite.models.Orders.findAll({
    include: [
        {
            model: 'Customers',
            as: 'customer',

            include: [
                {
                    model: 'Addresses',
                    as: 'address',
                },
            ],
        },
    ],
});
```

---

# Custom Join Conditions

```javascript
include: [
    {
        model: 'Products',

        as: 'products',

        on: ['id', 'categoryId'],
    },
];
```

---

# Aggregate Functions

Supported functions:

| Function   |
| ---------- |
| `COUNT`    |
| `SUM`      |
| `AVG`      |
| `MIN`      |
| `MAX`      |
| `UPPER`    |
| `LOWER`    |
| `LENGTH`   |
| `DATE`     |
| `TIME`     |
| `STRFTIME` |
| `NOW`      |

Example:

```javascript
await sqlite.models.User.findAll({
    attributes: [[sqlite.fn('AVG', 'salary'), 'avgSalary']],
});
```

---

# Operators

Use `sqlite.Op` for advanced queries.

```javascript
await sqlite.models.User.findAll({
    where: {
        [sqlite.Op.OR]: [
            {
                status: 'active',
            },
            {
                age: {
                    [sqlite.Op.GT]: 18,
                },
            },
        ],
    },
});
```

---

## Available Operators

| Operator | Description           |
| -------- | --------------------- |
| `EQ`     | Equal                 |
| `NE`     | Not equal             |
| `GT`     | Greater than          |
| `GTE`    | Greater than or equal |
| `LT`     | Less than             |
| `LTE`    | Less than or equal    |
| `IN`     | In array              |
| `NOT_IN` | Not in array          |
| `IS`     | NULL checks           |

---

# Migrations

Migrations allow version-controlled schema changes.

---

## Run Migrations

```javascript
await sqlite.migrate(migrations);
```

---

## Undo Migrations

```javascript
await sqlite.migrateUndo(migrations);
```

---

# queryInterface Methods

| Method         |
| -------------- |
| `createTable`  |
| `dropTable`    |
| `addColumn`    |
| `dropColumn`   |
| `renameTable`  |
| `renameColumn` |
| `bulkCreate`   |
| `bulkDelete`   |

---

# Migration Example

```javascript
const createUsers = {
    name: '001_create_users',

    up: async (queryInterface, sqlite) => {
        await queryInterface.createTable('Users', {
            id: {
                type: sqlite.datatypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            username: {
                type: sqlite.datatypes.STRING,
                unique: true,
            },
        });
    },

    down: async queryInterface => {
        await queryInterface.dropTable('Users');
    },
};
```

---

# Seeders

Seeders allow inserting initial data.

---

## Seeder Example

```javascript
const addUsers = {
    name: '001_add_users',

    up: async queryInterface => {
        await queryInterface.bulkCreate('Users', [
            {
                username: 'User1',
            },
            {
                username: 'User2',
            },
        ]);
    },

    down: async queryInterface => {
        await queryInterface.bulkDelete('Users', {
            where: {
                username: ['User1', 'User2'],
            },
        });
    },
};
```

---

# License

MIT

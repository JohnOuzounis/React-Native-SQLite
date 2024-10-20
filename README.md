# React Native SQLite ORM Tool Documentation

## Table of Contents

[Introduction](#introduction)
[Prerequisites](#prerequisites)
[Install](#add-react-native-sqlite-to-your-project)
[How-to-Use](#1-creating-an-sqlite-instance)
[Datatypes](#available-data-types)
[Operators](#using-operators)
[Associations](#3-adding-associations)
[DbProvider](#5-using-the-dbprovider-context)

## Introduction

This tool provides an ORM-like interface for handling SQLite database queries in React Native applications using JavaScript objects. It simplifies database operations by allowing you to define models, set up associations, and perform queries in an intuitive way.

This guide covers the following steps:

1. Creating an SQLite instance
2. Defining models
3. Adding associations
4. Using the `DbProvider` context

## Prerequisites

- **React Native application**
- **Expo SQLite**: Ensure you have the `expo-sqlite` package installed.

## Add React-Native-SQLite to your project

In your `package.json`, add the GitHub repository as a dependency:

```javascript
{
  "dependencies": {
    "React-Native-SQLite": "git+https://github.com/JohnOuzounis/React-Native-SQLite.git"
  }
}
```

or install it

```bash
npm install https://github.com/JohnOuzounis/React-Native-SQLite.git
```

## 1. Creating an SQLite Instance

First, create an instance of the SQLite helper and connect to your database.

### Import the SQLite Helper

```javascript
import { createSqlite } from "react-native-sqlite";
```

### Create and Connect the SQLite Instance

```javascript
const sqlite = createSqlite();

(async () => {
  await sqlite.connect("my_database_name.db");
})();
```

## 2. Defining Models

Models represent tables in your database. Use the `define` method to create models.

### Syntax

```javascript
const ModelName = sqlite.define("ModelName", attributes, options);
```

- **`ModelName`**: String representing the name of your model/table.
- **`attributes`**: Object defining the columns and their data types.
- **`options`**: (Optional) Additional model configurations.

### Example

```javascript
const User = sqlite.define("User", {
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

### Available Data Types

The `sqlite.datatypes` object provides various data types:

- `STRING`
- `INTEGER`
- `FLOAT`
- `BOOLEAN`
- `DATE`

You can create an enum using the `check` constraint for example

```javascript
sqlite.define("Table", {
  status: {
    type: sqlite.datatypes.STRING,
    check: ["WAITING", "COMPLETE"],
  },
});
```

## 3. Adding Associations

Associations define relationships between models (e.g., one-to-many, many-to-many).

### Example

```javascript
const Post = sqlite.define("Post", {
  id: {
    type: sqlite.datatypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: sqlite.datatypes.STRING,
    allowNull: false,
  },
  content: {
    type: sqlite.datatypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: sqlite.datatypes.INTEGER,
    allowNull: false,
  },
});

// Add associations
Post.belongsTo(User, {
  foreignKey: "userId",
});
```

### Association Methods

- **`belongsTo`**: Defines a many-to-one relationship or a one-to-one relationship. This will add a foreign key to the source model.

  - `target`: A string representing the name of the target model to which the source model belongs.
  - `options`: An object that contains options for defining the relationship.
    - `foreignKey`: An object specifying the foreign key settings. If not provided, the system will automatically use the format tableNameId.
      - `name`: A string to specify a custom name for the foreign key column.
      - `type`: The data type of the foreign key column (e.g., `sqlite.datatypes.INTEGER`).
    - `onDelete`: Specifies the action to be taken when the referenced target model is deleted (`CASCADE` or `SET NULL`).

```javascript
Post.belongsTo({
  target: "User",
  options: {
    foreignKey: {
      name: "userId",
      type: sqlite.datatypes.INTEGER,
    },
    onDelete: "CASCADE",
  },
});
```

- **`belongsToMany`**: Defines a many-to-many relationship and creates a joint table. The joint table will contain the primary keys of the two tables or `sourceModelId` and `TargetModelId`. It is highly recommended to define the joint model and use the belongsTo association.
  - `target`: A string representing the name of the target model to which the source model belongs.
  - `options`: An object that contains options for defining the relationship.
    - `through`: A string representing the name of the joint table. If not provided `sourceModel_targetModel` will be used.
    - `attributes`: An object with additional attributes for the joint table.
    - `onDelete`: Specifies the action to be taken when the referenced target model is deleted (`CASCADE` or `SET NULL`).

```javascript
Project.belongsToMany({
  target: "User",
  options: {
    through: 'UserProject'
    onDelete: "CASCADE",
  },
});
```

### Association Options

- **`foreignKey`**: The foreign key in the target model.

## 4. Synchronizing Models

Synchronize your models with the database using the `sync` method.

### Example

```javascript
(async () => {
  await sqlite.sync();
})();
```

This creates the necessary tables and relationships in the database.

## 5. Using the `DbProvider` Context

Use the `DbProvider` context to make the SQLite instance and models available throughout your React components.

### Setting Up `DbProvider`

```javascript
import React from "react";
import { DbProvider } from "react-native-sqlite/context/DbProvider";
import { createSqlite } from "react-native-sqlite";

const createDatabase = async () => {
  const sqlite = createSqlite();
  await sqlite.connnect("my_database_name.db");

  // Define models
  const User = sqlite.define("User", {
    /* attributes */
  });
  const Post = sqlite.define("Post", {
    /* attributes */
  });

  // Add associations
  Post.belongsTo(User, { foreignKey: "userId" });

  // Synchronize models
  await sqlite.sync();

  return sqlite;
};

const App = () => (
  <DbProvider createDatabase={createDatabase} fallback={<Loading />}>
    <YourAppComponents />
  </DbProvider>
);
```

- **`createDatabase`**: Async function that initializes the database.
- **`fallback`**: Component displayed while the database is loading.

### Accessing the Database with `useDb`

In your components, access the database using the `useDb` hook.

```javascript
import React, { useEffect, useState } from "react";
import { useDb } from "react-native-sqlite/context/DbProvider";

const UserList = () => {
  const sqlite = useDb();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const userList = await sqlite.models.User.findAll();
      setUsers(userList);
    };

    fetchUsers();
  }, [sqlite]);

  return (
    <View>
      {users.map((user) => (
        <Text key={user.id}>{user.username}</Text>
      ))}
    </View>
  );
};
```

**Note**: Ensure `useDb` is used within a component wrapped by `DbProvider`.

## Additional Model Methods

### CRUD Operations

- **Create**

  ```javascript
  const newUser = await sqlite.models.User.create({
    data: {
      username: "johndoe",
      email: "john@example.com",
      password: "securepassword",
    },
  });
  ```

- **Read**

  ```javascript
  const users = await sqlite.models.User.findAll();

  const user = await sqlite.models.User.findOne({
    options: { where: { id: 1 } },
  });
  ```

- **Update**

  ```javascript
  await sqlite.models.User.update({
    data: { email: "newemail@example.com" },
    options: { where: { id: 1 } },
  });
  ```

- **Delete**

  ```javascript
  await sqlite.models.User.destroy({ options: { where: { id: 1 } } });
  ```

- **Drop**

  ```javascript
  await sqlite.models.User.drop();
  ```

### Query Options

- **`where`**: Object specifying query conditions.
- **`attributes`**: Array of attributes to retrieve.
- **`include`**: Array of associated models to include.
- **`order`**: An array specifying the order in which the results should be returned.
- **`limit`**: A number that specifies the maximum number of records to return from the query.
- **`offset`**: A number that specifies the number of records to skip before starting to collect the result set.

### Using Operators

Use `sqlite.Op` for complex queries.

```javascript
db.models.User.findAll({
  options: {
    where: {
      [db.Op.OR]: [{ status: "active" }, { age: { [Op.gt]: 18 } }],
    },
  },
});
```

**Available Operators** (from `sqlite.Op`):

- `EQ`: Equal
- `NE`: Not equal
- `GT`: Greater than
- `GTE`: Greater than or equal
- `LT`: Less than
- `LTE`: Less than or equal
- `IN`: In
- `NOT_IN`: Not in

## Error Handling

Wrap async operations in `try...catch` blocks to handle errors.

```javascript
try {
  const user = await sqlite.models.User.create({
    /* data */
  });
} catch (error) {
  console.error("Error creating user:", error);
}
```

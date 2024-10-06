import { sqlite } from "../db/database";

const User = sqlite.define("User", {
  email: {
    type: sqlite.datatypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  value: {
    type: sqlite.datatypes.STRING,
  },
  intValue: {
    type: sqlite.datatypes.INTEGER,
  },
});

const Test = sqlite.define("Test", {});

const models = {
  User,
  Test,
};

User.belongsToMany({
  target: "Test",
  options: { through: "Bobo", onDelete: "CASCADE" },
});

export default models;

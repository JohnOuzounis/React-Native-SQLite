import * as SQLite from "expo-sqlite";
import { datatypes } from "./datatypes";
import methods from "./methods";
import { Op } from "./operations";

const sqlite = {
  models: {},
  instance: null,
  datatypes: Object.freeze(datatypes),
  Op: Object.freeze(Op),
  connect: async function (name) {
    this.instance = await SQLite.openDatabaseAsync(name);
  },

  define: function (model, attributes, options) {
    const readonlyAttributes = Object.freeze({ ...attributes });
    sqlite.models[model] = {
      attributes: readonlyAttributes,
      modelName: model,
      associations: {},
    };

    methods.addMethods(sqlite.models[model], this);
    console.log("defined", model);

    return sqlite.models[model];
  },
  sync: async function () {
    this.instance?.withExclusiveTransactionAsync(async () => {
      await this.instance.execAsync(
        `PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;`
      );

      await Promise.all(
        Object.values(this.models).map((model) =>
          model.init({ model, sqlite: this })
        )
      );
    });
  },
  transaction: async function (func) {
    try {
      return await this.instance?.withExclusiveTransactionAsync(func);
    } catch (error) {
      throw error;
    }
  },
};

export const createSqlite = () => {
  return { ...sqlite };
};

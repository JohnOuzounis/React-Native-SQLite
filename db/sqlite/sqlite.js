import * as SQLite from "expo-sqlite";
import { datatypes } from "./datatypes";
import methods from "./methods";
import { Op } from "./operations";
import { buildModelTree } from "./utils";

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
    // const models = Object.values(this.models);
    // function traverseAndInit(node) {
    //   node.children.forEach((child) => traverseAndInit.call(this, child));
    //   const model = this.models[node.name];
    //   if (model) {
    //     model.init();
    //   }
    // }
    // const tree = buildModelTree(models);
    // tree.forEach((root) => traverseAndInit.call(this, root));

    this.instance?.withExclusiveTransactionAsync(async () => {
      await this.instance.execAsync(`PRAGMA journal_mode = WAL;`);
      await this.instance.execAsync(`PRAGMA foreign_keys = ON;`);

      await Promise.all(
        Object.values(this.models).map((model) =>
          model.init({ model, sqlite: this })
        )
      );
    });
  },
};

export const createSqlite = () => {
  return { ...sqlite };
};

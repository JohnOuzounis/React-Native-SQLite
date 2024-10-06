import { sqlite } from "./database";

export const connectToDb = async () => {
  await sqlite.connnect(process.env.EXPO_PUBLIC_DB_NAME);
  sqlite.sync();

  return sqlite;
};

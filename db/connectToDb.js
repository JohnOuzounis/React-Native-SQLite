import { sqlite } from "./database";

export const connectToDb = async () => {
  try {
    await sqlite.connect(process.env.EXPO_PUBLIC_DB_NAME);
    await sqlite.sync();
  } catch (error) {
    console.log(error);
  }

  return sqlite;
};

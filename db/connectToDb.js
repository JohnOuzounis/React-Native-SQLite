import { sqlite } from './database';
import migrations from '../migrations';
import seeders from '../seeders';

export const connectToDb = async () => {
    try {
        await sqlite.connect(process.env.EXPO_PUBLIC_DB_NAME);
        await sqlite.migrateUndo(migrations);
        await sqlite.migrate(migrations);
        await sqlite.seedUndo(seeders);
        await sqlite.seed(seeders);
        await sqlite.sync();
    } catch (error) {
        console.log(error);
    }

    return sqlite;
};

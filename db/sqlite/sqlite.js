import * as SQLite from 'expo-sqlite';

import { datatypes } from './datatypes';
import { Op } from './operations';

import logger from './logger/logger';

import { query, run, exec, transaction } from './database-client';

import { defineModel } from './model-registry';
import { fn } from './sql-functions';
import { runTasks } from './task-runner';

export class SQLiteORM {
    models = {};
    instance = null;

    datatypes = Object.freeze(datatypes);
    Op = Object.freeze(Op);

    async connect(name) {
        this.instance = await SQLite.openDatabaseAsync(name);

        logger.active = false;

        this.define('Migrations', {
            name: { type: this.datatypes.STRING },
        });

        this.define('Seeders', {
            name: { type: this.datatypes.STRING },
        });

        await Promise.all([
            this.models.Migrations.init({
                model: this.models.Migrations,
                sqlite: this,
            }),
            this.models.Seeders.init({
                model: this.models.Seeders,
                sqlite: this,
            }),
        ]);

        logger.active = true;
    }

    define(name, attributes, options) {
        return defineModel(this, name, attributes, options);
    }

    fn(...args) {
        return fn(...args);
    }

    query(sql, params) {
        return query(this.instance, sql, params);
    }

    run(sql, params) {
        return run(this.instance, sql, params);
    }

    exec(sql) {
        return exec(this.instance, sql);
    }

    transaction(callback) {
        return transaction(this.instance, callback);
    }

    async sync() {
        return this.transaction(async () => {
            await this.exec(
                'PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;',
            );

            await Promise.all(
                Object.values(this.models).map(model =>
                    model.init({
                        model,
                        sqlite: this,
                    }),
                ),
            );
        });
    }

    migrate(tasks) {
        return this.#runRegistryTasks(
            tasks,
            this.models.Migrations,
            'up',
            'Migration successful!',
        );
    }

    migrateUndo(tasks) {
        return this.#runRegistryTasks(
            tasks,
            this.models.Migrations,
            'down',
            'Migration successful!',
        );
    }

    seed(tasks) {
        return this.#runRegistryTasks(
            tasks,
            this.models.Seeders,
            'up',
            'Seeding successful!',
        );
    }

    seedUndo(tasks) {
        return this.#runRegistryTasks(
            tasks,
            this.models.Seeders,
            'down',
            'Seeding successful!',
        );
    }

    #runRegistryTasks(tasks, registry, direction, successMessage) {
        return runTasks({
            sqlite: this,
            tasks,
            registry,
            direction,
            successMessage,
        });
    }
}

export default () => new SQLiteORM();

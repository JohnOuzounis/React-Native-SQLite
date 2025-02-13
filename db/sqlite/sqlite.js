import * as SQLite from 'expo-sqlite';
import { datatypes } from './datatypes';
import methods from './methods';
import { Op } from './operations';
import createInterface from './queryInterface';
import logger from './logger/logger';

const sqlite = {
    models: {},
    instance: null,
    datatypes: Object.freeze(datatypes),
    Op: Object.freeze(Op),
    connect: async function (name) {
        this.instance = await SQLite.openDatabaseAsync(name);
        logger.active = false;

        this.define('Migrations', {
            name: {
                type: this.datatypes.STRING,
            },
        });
        await this.models.Migrations.init({
            model: this.models.Migrations,
            sqlite: this,
        });

        logger.active = true;
    },
    fn: function (funcName, ...args) {
        const supportedFunctions = {
            NOW: {
                sql: 'DATETIME',
                args: ["'now'"],
            },
            COUNT: 'COUNT',
            SUM: 'SUM',
            AVG: 'AVG',
            MAX: 'MAX',
            MIN: 'MIN',
            UPPER: 'UPPER',
            LOWER: 'LOWER',
            LENGTH: 'LENGTH',
            DATE: 'DATE',
            TIME: 'TIME',
            STRFTIME: 'STRFTIME',
        };

        const upperName = funcName.toUpperCase();
        const funcConfig = supportedFunctions[upperName];

        if (!funcConfig) {
            throw new Error(`Unsupported SQL function: ${funcName}`);
        }

        // Handle functions with predefined arguments (like NOW)
        if (typeof funcConfig === 'object') {
            const combinedArgs = [...funcConfig.args, ...args];
            return `${funcConfig.sql}(${combinedArgs.join(', ')})`;
        }

        // Handle normal functions
        if (args.length === 0) {
            return `${funcConfig}()`;
        }

        return `${funcConfig}(${args.join(', ')})`;
    },
    define: function (model, attributes, options = {}) {
        sqlite.models[model] = {
            attributes: attributes,
            modelName: model,
            associations: {},
            timestamps: options?.timestamps ?? true,
            localtime: options?.localtime ?? false,
            paranoid: options?.paranoid ?? false,
        };

        methods.addMethods(sqlite.models[model], this);
        logger.log('defined', model);

        return sqlite.models[model];
    },
    sync: function () {
        return this.instance?.withExclusiveTransactionAsync(async () => {
            await this.instance.execAsync(
                `PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;`
            );

            await Promise.all(
                Object.values(this.models).map(model =>
                    model.init({ model, sqlite: this })
                )
            );
        });
    },
    transaction: function (func) {
        return this.instance?.withExclusiveTransactionAsync(func);
    },
    migrate: function (migrations) {
        return this.instance?.withExclusiveTransactionAsync(async () => {
            if (!migrations) return;

            const queryInterface = createInterface(this);
            const orderedMigrations = migrations.sort((a, b) =>
                a.name.localeCompare(b.name)
            );

            try {
                logger.log('Running up migrations...');
                for (const migration of orderedMigrations) {
                    logger.active = false;

                    const exists = await this.models.Migrations.findAll({
                        where: { name: migration.name },
                    });

                    if (exists.length !== 0) continue;

                    await migration.up(queryInterface, this);
                    await this.models.Migrations.create({
                        name: migration.name,
                    });

                    logger.active = true;
                    logger.log(migration.name);
                }
                logger.log('Migration successfull!');
            } catch (error) {
                logger.active = true;
                logger.log('Error running migrations');
                throw error;
            }
        });
    },
    migrateUndo: function (migrations) {
        return this.instance?.withExclusiveTransactionAsync(async () => {
            if (!migrations) return;

            const queryInterface = createInterface(this);
            const orderedMigrations = migrations.sort((a, b) =>
                b.name.localeCompare(a.name)
            );

            try {
                logger.log('Running down migrations...');
                for (const migration of orderedMigrations) {
                    logger.active = false;

                    const exists = await this.models.Migrations.findAll({
                        where: { name: migration.name },
                    });

                    if (exists.length === 0) continue;

                    await migration.down(queryInterface, this);
                    await this.models.Migrations.destroy({
                        where: {
                            name: migration.name,
                        },
                    });

                    logger.active = true;
                    logger.log(migration.name);
                }
                logger.log('Migration successfull!');
            } catch (error) {
                logger.active = true;
                logger.log('Error running migrations');
                throw error;
            }
        });
    },
};

const createSqlite = () => {
    return { ...sqlite };
};

export default createSqlite;

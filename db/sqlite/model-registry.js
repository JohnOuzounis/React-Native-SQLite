import methods from './methods';
import logger from './logger/logger';

export const defineModel = (sqlite, name, attributes, options = {}) => {
    if (sqlite.models[name]) {
        return sqlite.models[name];
    }

    const model = {
        modelName: name,
        attributes,
        associations: {},
        timestamps: options.timestamps ?? true,
        localtime: options.localtime ?? false,
        paranoid: options.paranoid ?? false,
    };

    sqlite.models[name] = model;

    methods.addMethods(model, sqlite);

    logger.log('defined', name);

    return model;
};

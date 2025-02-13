const rules = {
    primaryKey: () => ' PRIMARY KEY',
    autoIncrement: attribute =>
        attribute.type === datatypes.INTEGER ? ' AUTOINCREMENT' : '',
    allowNull: attribute => (attribute.allowNull === false ? ' NOT NULL' : ''),
    unique: () => ' UNIQUE',
    check: (attribute, name) =>
        Array.isArray(attribute.check)
            ? ` CHECK (${name} IN (${attribute.check
                  .map(att => `'${att}'`)
                  .join(', ')}))`
            : '',
    defaultValue: attribute =>
        attribute.defaultValue !== undefined
            ? ` DEFAULT (${attribute.defaultValue})`
            : '',
};

const defineColumn = (attributeName, attributeConfig) => {
    let columnDefinition = `${attributeName} ${attributeConfig.type}`;

    for (const key of Object.keys(attributeConfig)) {
        columnDefinition += rules[key]?.(attributeConfig, attributeName) ?? '';
    }
    return columnDefinition;
};

const generateAlter = (model, funcName, args) => {
    const supportedFunctions = {
        RENAMETABLE: ({ newName }) => {
            return `RENAME TO ${newName}`;
        },
        RENAMECOLUMN: ({ columnName, newName }) => {
            return `RENAME ${columnName} TO ${newName}`;
        },
        ADDCOLUMN: ({ columnName, attributes }) => {
            return `ADD COLUMN ${defineColumn(columnName, attributes)}`;
        },
        DROPCOLUMN: ({ columnName }) => {
            return `DROP COLUMN ${columnName}`;
        },
    };

    const upperName = funcName.toUpperCase();
    const funcConfig = supportedFunctions[upperName];

    if (!funcConfig) {
        throw new Error(`Unsupported SQL function: ${funcName}`);
    }

    const alterQuery = `ALTER TABLE ${model.modelName} ${funcConfig(args)};`;
    return alterQuery;
};

export default generateAlter;

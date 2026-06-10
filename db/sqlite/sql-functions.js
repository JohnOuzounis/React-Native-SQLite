// sql-functions.js

const FUNCTIONS = {
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

export const fn = (name, ...args) => {
    const func = FUNCTIONS[name.toUpperCase()];

    if (!func) {
        throw new Error(`Unsupported SQL function: ${name}`);
    }

    if (typeof func === 'object') {
        return `${func.sql}(${[...func.args, ...args].join(', ')})`;
    }

    return `${func}(${args.join(', ')})`;
};

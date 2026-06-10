export const query = (instance, sql, params = []) =>
    instance?.getAllAsync(sql, params);

export const run = (instance, sql, params = []) =>
    instance?.runAsync(sql, params);

export const exec = (instance, sql) => instance?.execAsync(sql);

export const transaction = (instance, fn) =>
    instance?.withExclusiveTransactionAsync(fn);

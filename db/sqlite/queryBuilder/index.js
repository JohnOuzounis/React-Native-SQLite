const queryBuilder = {
    count: require('./count').default,
    create: require('./create').default,
    insert: require('./insert').default,
    select: require('./select').default,
    update: require('./update').default,
    upsert: require('./upsert').default,
    delete: require('./delete').default,
    selectCount: require('./selectCount').default,
    drop: require('./drop').default,
    alter: require('./alter').default,
};

export default queryBuilder;

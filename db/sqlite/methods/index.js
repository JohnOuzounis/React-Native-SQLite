const methodsObjs = [
    require('./create').default,
    require('./delete').default,
    require('./find').default,
    require('./basic').default,
    require('./update').default,
    require('./associations').default,
];

export default {
    addMethods: (model, sqlite) => {
        console.log(methodsObjs);
        methodsObjs.forEach(methods => {
            Object.entries(methods).forEach(([name, func]) => {
                model[name] = async function (...args) {
                    // change func signature ({sqlite, model, args}) -> const [arg1, arg2] = args
                    const params = {};
                    params.sqlite = sqlite;
                    params.model = model;
                    params.args = args;
                    return await func(params);
                };
            });
        });
    },
};

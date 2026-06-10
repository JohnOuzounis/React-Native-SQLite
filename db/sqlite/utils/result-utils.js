import {
    getPrimaryKey,
    getAssociation,
    isMultiAssociation,
} from './association-utils';

const getSelectedPrimaryKeyAlias = (model, attrs) => {
    const pk = getPrimaryKey(model);

    for (const attr of attrs) {
        if (Array.isArray(attr)) {
            const [source, alias] = attr;

            if (source === pk || source.endsWith(`.${pk}`)) {
                return alias;
            }
        } else if (attr === pk) {
            return pk;
        }
    }

    return pk;
};

const getNodeData = (row, attributes) =>
    attributes.reduce((data, attribute) => {
        if (Array.isArray(attribute)) {
            data[attribute[1]] = row[attribute[1]];
        } else {
            data[attribute] = row[attribute];
        }

        return data;
    }, {});

const getAssociationNode = (parentNode, associationName, childId) => {
    parentNode.__children ??= {};
    parentNode.__children[associationName] ??= new Map();

    const childMap = parentNode.__children[associationName];

    return {
        childMap,
        childNode: childMap.get(childId),
    };
};

const attachChild = (parentNode, associationName, childNode, isMany) => {
    if (isMany) {
        parentNode[associationName] ??= [];
        parentNode[associationName].push(childNode);
    } else {
        parentNode[associationName] = childNode;
    }
};

const processIncludes = (parentNode, row, includes, parentModel, sqlite) => {
    for (const include of includes) {
        const { as, attributes, include: nested = [], model } = include;

        const association = getAssociation(
            parentModel.modelName,
            model,
            sqlite,
            as,
        );

        if (!association) {
            throw new Error(
                `Association "${model}" not found on model "${parentModel.modelName}"`,
            );
        }

        const associationName = as || association.as;
        const childModel = association.target;
        const childAttributes =
            attributes || Object.keys(childModel.attributes);

        const childId =
            row[getSelectedPrimaryKeyAlias(childModel, childAttributes)];

        if (childId == null) {
            continue;
        }

        const { childMap, childNode: existingNode } = getAssociationNode(
            parentNode,
            associationName,
            childId,
        );

        let childNode = existingNode;

        if (!childNode) {
            childNode = getNodeData(row, childAttributes);

            childMap.set(childId, childNode);

            const isMany = isMultiAssociation(association.associationType);
            attachChild(parentNode, associationName, childNode, isMany);
        }

        if (nested.length) {
            processIncludes(childNode, row, nested, childModel, sqlite);
        }
    }
};

const cleanNode = node => {
    if (node.__children) {
        Object.values(node.__children).forEach(children => {
            children.forEach(cleanNode);
        });

        delete node.__children;
    }

    Object.values(node).forEach(value => {
        if (Array.isArray(value)) {
            value.forEach(child => {
                if (child && typeof child === 'object') {
                    cleanNode(child);
                }
            });
        }
    });
};

export const getGroupedResults = (results, model, options = {}, sqlite) => {
    const { include, attributes } = options;

    if (!include?.length) {
        return results;
    }

    const rootModel = sqlite.models[model.modelName];
    const rootAttributes = attributes || Object.keys(rootModel.attributes);

    const rootIdColumn = getSelectedPrimaryKeyAlias(rootModel, rootAttributes);

    const rootMap = new Map();

    for (const row of results) {
        const rootId = row[rootIdColumn];

        let rootNode = rootMap.get(rootId);

        if (!rootNode) {
            rootNode = getNodeData(row, rootAttributes);
            rootMap.set(rootId, rootNode);
        }

        processIncludes(rootNode, row, include, rootModel, sqlite);
    }

    const groupedResults = Array.from(rootMap.values());

    groupedResults.forEach(cleanNode);

    return groupedResults;
};

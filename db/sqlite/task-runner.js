import createInterface from './queryInterface';
import logger from './logger/logger';

export const runTasks = async ({
    sqlite,
    tasks,
    registry,
    direction,
    successMessage,
}) => {
    if (!tasks) return;

    const queryInterface = createInterface(sqlite);

    const ordered = [...tasks].sort((a, b) =>
        direction === 'up'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name),
    );

    for (const task of ordered) {
        logger.active = false;

        const exists = await registry.findAll({
            where: { name: task.name },
        });

        if (
            (direction === 'up' && exists.length) ||
            (direction === 'down' && !exists.length)
        ) {
            continue;
        }

        await task[direction](queryInterface, sqlite);

        if (direction === 'up') {
            await registry.create({ name: task.name });
        } else {
            await registry.destroy({
                where: { name: task.name },
            });
        }

        logger.active = true;
        logger.log(task.name);
    }

    logger.log(successMessage);
};

import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const PORT = config.port;

app.listen(PORT, () => {
    logger.info(`CineZone API démarrée sur http://localhost:${PORT}`);
    logger.info(`Environment: ${config.env}`);
});

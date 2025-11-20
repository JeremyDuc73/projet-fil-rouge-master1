const formatDate = () => {
    return new Date().toISOString();
};

const log = (level, message, meta = {}) => {
    const logEntry = {
        timestamp: formatDate(),
        level,
        message,
        ...(Object.keys(meta).length > 0 && { meta })
    };
    
    const formattedLog = `[${logEntry.timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (level === 'error') {
        console.error(formattedLog, meta);
    } else if (level === 'warn') {
        console.warn(formattedLog, meta);
    } else {
        console.log(formattedLog, meta);
    }
};

export const logger = {
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta),
    debug: (message, meta) => log('debug', message, meta)
};

const LOG_LEVELS = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const CURRENT_LEVEL = process.env.LOG_LEVEL || 'http';

function log(level, message, meta = {}) {
    if (LOG_LEVELS[level] > LOG_LEVELS[CURRENT_LEVEL]) return;
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta
    };
    const output = JSON.stringify(entry);
    if (level === 'error' || level === 'warn') {
        console.error(output);
    } else {
        console.log(output);
    }
}

const logger = {
    error: (msg, meta) => log('error', msg, meta),
    warn:  (msg, meta) => log('warn',  msg, meta),
    info:  (msg, meta) => log('info',  msg, meta),
    http:  (msg, meta) => log('http',  msg, meta),
    debug: (msg, meta) => log('debug', msg, meta),

    // Express middleware: logs each incoming request
    middleware() {
        return (req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                log('http', 'request', {
                    method: req.method,
                    url: req.originalUrl,
                    status: res.statusCode,
                    ms: Date.now() - start,
                    ip: req.ip
                });
            });
            next();
        };
    }
};

module.exports = logger;

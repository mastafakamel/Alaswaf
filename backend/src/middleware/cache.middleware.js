const NodeCache = require("node-cache");

// Cache for 5 minutes by default
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Simple middleware to cache GET requests based on URL
 * @param {number} ttl - Time to live in seconds
 */
const cacheMiddleware = (ttl) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== "GET") {
            return next();
        }

        const key = req.originalUrl || req.url;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            return res.json(cachedResponse);
        }

        // Intercept res.json to store the response in cache
        const originalJson = res.json;
        res.json = function (data) {
            cache.set(key, data, ttl);
            return originalJson.call(this, data);
        };

        next();
    };
};

module.exports = { cacheMiddleware, cache };

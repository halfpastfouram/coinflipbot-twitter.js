'use strict';

class Redis
{
    /**
     * Redis constructor
     * @param {RedisClient} redisClient
     */
    constructor(redisClient)
    {
        this._redisClient = redisClient;
    }

    /**
     * Add a pixel to the database.
     * @param tweet
     * @param result
     * @param status
     */
    markReplied(tweet, result, status)
    {
        // Add the pixel to the current set.
        let data = {
            tweet_id: tweet.id,
            result: result,
            status: status
        };

        this._redisClient.zadd(['coinflipbot_replies', tweet.id, JSON.stringify(data)]);
    }

    /**
     * @param tweet
     * @param callback
     * @returns {boolean}
     */
    replyExists(tweet, callback)
    {
        this._redisClient.zrangebyscore(['coinflipbot_replies', tweet.id, tweet.id], (error, data) => {
            callback.apply(this, [data.length, data[0]]);
        });

        return false;
    }
}

module.exports = Redis;
const Twit        = require('twit');
const redis       = require('redis');
const RedisMapper = require('./Redis');
const T           = new Twit(require('./Config'));

let mapper            = new RedisMapper(redis.createClient());
let sides             = ['heads', 'tails'];
let responseTemplates = {
    greetings: [
        'Hi, {mention}.',
        'Beep boop.',
        'Alright!',
        'Here you go.',
        'You got it!',
        'At your service, {mention}.',
        'Done!',
        'Ok.',
        'Right.',
        'Gotcha.'
    ],
    messages: [
        'I flipped a coin for you. The result was {result}!',
        '{result}.',
        'The result is: {result}.',
        'The coin landed on {result}.',
        '{result} it is!'
    ]
};

/**
 * Reply to the given tweet with a coin flip result.
 * @param tweet
 */
function reply(tweet)
{
    // Pick a random greeting and message.
    let greeting = responseTemplates.greetings[Math.floor(Math.random() * responseTemplates.greetings.length)];
    let message  = responseTemplates.messages[Math.floor(Math.random() * responseTemplates.messages.length)];

    // Flip the coin.
    let decision = sides[Math.round(Math.random())];

    // Prepare post params.
    let params = {
        status: `${greeting} ${message}`.replace('{mention}', tweet.user.screen_name).replace('{result}', decision),
        in_reply_to_status_id: tweet.id
    };

    // Post to twitter.
    T.post('statuses/update', params, (error) => {
        if (error !== undefined) {
            // Log errors to STDOUT.
            console.log(error);
        } else {
            // Mark subject tweet as replied to.
            mapper.markReplied(tweet, decision, params.status);
            console.log('Tweeted: ' + params.status);
        }
    });
}

let stream = T.stream('statuses/filter', {track: ['@coinflipbot']});
stream.on('tweet', reply);

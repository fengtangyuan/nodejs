import https from 'follow-redirects/https.js';

https.get('https://jable.tv/hot/', response => {
    response.on('data', chunk => {
        console.log(chunk);
    });
}).on('error', err => {
    console.error(err);
});
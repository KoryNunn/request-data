///[readme.md]
var queryString = require('querystring');

function getRequestData(maxSize, raw, callback){

    if(typeof maxSize !== 'number'){
        callback = raw;
        raw = maxSize;
        maxSize = null;
    }

    if(typeof raw !== 'boolean'){
        callback = raw;
        raw = null;
    }

    return function(){
        var data = Buffer.from(''),
            args = Array.prototype.slice.call(arguments),
            request = args[0],
            dataCallbacks = [],
            result;


        function complete(){
            dataCallbacks.forEach(function(dataCallback){
                dataCallback.apply(null, result);
            });
        }

        request.on('data',function(chunk){
            if(data.length + chunk.length > (maxSize || getRequestData.maxRequestSize || 1e6)){
                // flood attack, kill.
                result = [new Error('Request data exceeded maxSize')];
                request.connection.destroy();
                complete();
                return;
            }
            data = Buffer.concat([data, chunk]);
        });

        request.on('end', function(){
            if(result){
                return;
            }

            if (raw) {
                result = [null, data];
            } else if (data.length) {
                var parser = getRequestData.parsers[request.headers['content-type']] || getRequestData.parsers['application/json'];
                try {
                    body = parser(data.toString());
                    result = [null, body];
                } catch (error) {
                    //Invalid data
                    result = [error];
                }
            } else {
                result = [];
            }

            complete();
        });

        callback.apply(null, args.concat([function(dataCallback){
            if(result){
                return dataCallback.apply(null, result);
            }

            dataCallbacks.push(dataCallback);
        }]));
    };
}
getRequestData.parsers = {
    'application/x-www-form-urlencoded': queryString.parse,
    'application/json': JSON.parse
};
module.exports = getRequestData;

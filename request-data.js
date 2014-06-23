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
        var data = '',
            args = Array.prototype.slice.call(arguments),
            request = args[0];

        request.on('data',function(chunk){
            if(data.length > (maxSize || getRequestData.maxRequestSize || 1e6)){
                // flood attack, kill.
                request.connection.destroy();
            }
            data += chunk.toString();
        });

        request.on('end', function(){
            var newArg;
            if (raw) {
                newArg = data;
            } else if (data) {
                var parser = getRequestData.parsers[request.headers['content-type']] || getRequestData.parsers['application/json'];
                try {
                    newArg = parser(data);
                } catch (e) {
                    //Invalid data
                    newArg = e;
                }
            }
            callback.apply(null, args.concat([newArg]));
        });
    };
}
getRequestData.parsers = {
    'application/x-www-form-urlencoded': queryString.parse,
    'application/json': JSON.parse
};
module.exports = getRequestData;

///[readme.md]

function getRequestData(maxSize, raw, callback){
    return function(){
        var data = '',
            args = Array.prototype.slice.call(arguments),
            request = args[0],
            response = args[1];

        if(typeof maxSize !== 'number'){
            callback = raw;
            raw = maxSize;
            maxSize = null;
        }

        if(typeof raw !== 'bool'){
            callback = raw;
            raw = null;
        }

        request.on('data',function(chunk){
            if (data.length > maxSize || 1e6) {
                // flood attack, kill.
                request.connection.destroy();
            }
            data += chunk.toString();
        });

        request.on('end', function(){
            callback.apply(null, args.concat([raw ? data : data ? JSON.parse(data) : undefined]));
        });
    };
}
module.exports = getRequestData;
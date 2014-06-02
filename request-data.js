///[readme.md]

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

                try {
                    newArg = JSON.parse(data);
                } catch (e) {
                    //Invalid json
                    newArg = e;
                }
            }
            callback.apply(null, args.concat([newArg]));
        });
    };
}
module.exports = getRequestData;

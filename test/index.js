var grape = require('grape'),
    EventEmitter = require('events').EventEmitter,
    requestData = require('../');

function createFakeRequest(data){
    var request = new EventEmitter();

    request.connection = {
        destroy: function(){}
    };

    process.nextTick(function(){
        if(data){
            request.emit('data', data);
        }

        process.nextTick(function(){
            request.emit('end');
        });
    });

    return request;
}

grape('get data', function(t){
    t.plan(1);

    var responseData = {thing:'stuff'};

    var handler = requestData(function(request, response, data){
        t.deepEqual(data, responseData);
    });

    handler(
        createFakeRequest(
            JSON.stringify(responseData)
        ),
        {}
    );
});

grape('get bad data', function(t){
    t.plan(1);

    var handler = requestData(function(request, response, data){
        t.ok(data instanceof Error);
    });

    handler(
        createFakeRequest(
            'not valid json'
        ),
        {}
    );
});

grape('get no data', function(t){
    t.plan(1);

    var handler = requestData(function(request, response, data){
        t.equal(data, undefined);
    });

    handler(
        createFakeRequest(),
        {}
    );
});
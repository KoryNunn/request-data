var grape = require('grape'),
    EventEmitter = require('events').EventEmitter,
    requestData = require('../');

function createFakeRequest(data, contentType){
    var request = new EventEmitter();

    request.headers = {
        'content-type': contentType || ''
    };

    request.connection = {
        destroy: function(){}
    };

    process.nextTick(function(){
        if(data){
            request.emit('data', Buffer.from(data));
        }

        process.nextTick(function(){
            request.emit('end');
        });
    });
    return request;
}

grape('get data', function(t){
    t.plan(1);

    var sendData = {thing:'stuff'};

    var handler = requestData(function(request, response, data){
        t.deepEqual(data, sendData);
    });

    handler(
        createFakeRequest(
            JSON.stringify(sendData)
        ),
        {}
    );
});

grape('get form data', function(t){
    t.plan(1);

    var formData = 'thing=stuff&dingle=berry',
        sendData = {
            thing: 'stuff',
            dingle: 'berry'
        },
        contentType = 'application/x-www-form-urlencoded';

    var handler = requestData(function(request, response, data){
       t.deepEqual(data, sendData);
    });

    handler(
        createFakeRequest(
            formData,
            contentType
        ),
        {}
    );
});

grape('get json data', function(t){
    t.plan(1);

    var sendData = {
            thing: 'stuff',
            dingle: 'berry'
        },
        contentType = 'application/json';

    var handler = requestData(function(request, response, data){
       t.deepEqual(data, sendData);
    });

    handler(
        createFakeRequest(
            JSON.stringify(sendData),
            contentType
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

grape('get data over maxSize', function(t){
    t.plan(1);

    var handler = requestData(20, function(request, response, data){
        t.ok(data instanceof Error);
    });

    var sendData = {
        key: "value that is too long"
    };

    handler(
        createFakeRequest(JSON.stringify(sendData)),
        {}
    );
});
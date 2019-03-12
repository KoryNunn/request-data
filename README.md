# request-data

## `getRequestData(maxSize[optional], raw[optional], callback)`

Wraps any `fn(request, response)` function, parses the requests body, and calls the wrapped function with `getData` as the last parameter.

### Normal usage:

```js
"/myRoute": getRequestData(function(request, response, getData) {
    // ...
});
```

### With a named handler:

```js
// Handler
function handleThing(request, response, getData) {
    // ...
}
```

`handleThing` will be passed the arguments of `request`, `response`, `getData`

```js
"/myRoute": getRequestData(handleThing);
```

If you want to use it with a custom router that adds params after `request`/`response`, it will still work.

```js
// beeline syntax

"/myRoute/`things`": getRequestData(function(request, response, tokens, values, getData) {
    // ...
});
```

By default request-data will kill a request if you try and send it more than `1e6` bytes.

This can be overriden per handler:

```js
getRequestData(1e10, function(request, response, getData){
    // ...
});
```

Or globally:

If a request is killed, an error will be passed to `getData`

```js
getRequestData.maxRequestSize = 1e10;
```
If dataSize is greater than maxSize or data fails to parse during `JSON.parse`, the parse error is passed to the handler instead of data

```js
"/myRoute":getRequestData(function(request, response, getData){
    getData(function(error, data){
        if (data instanceof Error) {
                // Bad request
                response.statusCode = 400;
                response.end();
                return;
        }

        // Otherwise, data was valid, and has been parsed.
    }
});
```

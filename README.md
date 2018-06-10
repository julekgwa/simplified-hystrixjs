# simplified-hystrixjs

A simplified hystrixjs library for Nodejs based on [hystrixjs](https://www.npmjs.com/package/hystrixjs)

### Install
```
$ npm i simplified-hystrixjs -S
```

### Usage
```
const simplifiedHystrixjs = require('simplified-hystrixjs');

function hello(name) {
  return new Promise(function(resolve, reject) {
    setTimeout(function () {
      resolve(`Hello, ${name}`)
    }, 1000);
  });
}

const serviceCommand = simplifiedHystrixjs.createCommands(hello, { name : 'HelloService'});

app.get('/hello', async (req, res) => {
  try {
    const response = await serviceCommand.hello(req.query.name);
    res.send(response)
  } catch (e) {
    console.log(e);
  }
});
```

### Methods

**createCommands(fn, service);**

**fn** - can be of type object, Array of functions or a function.

**service** - service object with the following properties

* *statisticalWindowNumberOfBuckets* - number of buckets within the statistical window
* *statisticalWindowLength* - length of the window to keep track of execution counts metrics (success, failure)
* *errorThreshold* - error percentage threshold to trip the circuit
* *timeout* for request
* *errorHandler* - function to validate if the error response from the service is an actual error.
* *cbRequestVolume* - minimum number of requests in a rolling window
* *cbsleep* - how long the circuit breaker should stay opened.
* *name* - service name

### Monitoring

install [rxjs@^5.5.0](https://www.npmjs.com/package/rxjs) and expose a monitoring endpoint.

```
const hystrixSSEStream = require('hystrixjs').hystrixSSEStream;

function hystrixStreamResponse(request, response) {
    response.setHeader('Content-Type', 'text/event-stream;charset=UTF-8');
    response.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    response.setHeader('Pragma', 'no-cache');
    return hystrixSSEStream.toObservable().subscribe(
        function onNext(sseData) {
            response.write('data: ' + sseData + '\n\n');
        },
        function onError(error) {console.log(error);
        },
        function onComplete() {
            return response.end();
        }
    );
};

app.get('/api/hystrx.stream', hystrixStreamResponse);
```

### Hystrix Dashboard

to run the dashboard, download [standalone-hystrix-dashboard](https://bintray.com/kennedyoliveira/maven/standalone-hystrix-dashboard)

and run
```
$ java -jar standalone-hystrix-dashboard-{VERSION}-all.jar
```
Access the dashboard in  your browser: http://localhost:7979/hystrix-dashboard

### Contributing

We gladly welcome pull requests and code contributions, take care to maintain the existing coding style.

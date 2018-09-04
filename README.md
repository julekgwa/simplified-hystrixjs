[![Build Status](https://travis-ci.org/julekgwa/simplified-hystrixjs.svg?branch=master)](https://travis-ci.org/julekgwa/simplified-hystrixjs) [![npm version](https://badge.fury.io/js/simplified-hystrixjs.svg)](https://badge.fury.io/js/simplified-hystrixjs)

# simplified-hystrixjs

A simplified hystrixjs library for Nodejs based on [opossum](https://www.npmjs.com/package/opossum)

### Install
```
$ npm i simplified-hystrixjs -S
```

### Usage
```
const { createHystrixCommands, createHystrixStream, getPrometheusStream } = require('simplified-hystrixjs');

function hello(name) {
  return new Promise(function(resolve, reject) {
    setTimeout(function () {
      resolve(`Hello, ${name}`)
    }, 1000);
  });
}

const serviceCommand = createHystrixCommands(hello, { name : 'HelloService'});

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
* *cbRequestVolume* - minimum number of requests in a rolling window
* *cbsleep* - how long the circuit breaker should stay opened.
* *name* - service name
* *isFailure* - emitted when the breaker action fails, called with the error

### Monitoring

Expose a monitoring endpoint for hystrix stream.

```
createHystrixStream(app, /*[endpoint]*/); // default /manage/hystrix.stream
```

Prometheus stream.

```
getPrometheusStream()
```

### Hystrix Dashboard

to run the dashboard, download [standalone-hystrix-dashboard](https://bintray.com/kennedyoliveira/maven/standalone-hystrix-dashboard)
̨
and run
```
$ java -jar standalone-hystrix-dashboard-{VERSION}-all.jar
```
Access the dashboard in  your browser: http://localhost:7979/hystrix-dashboard

### Contributing

We gladly welcome pull requests and code contributions, take care to maintain the existing coding style.

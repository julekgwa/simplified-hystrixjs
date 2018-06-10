const restify = require('restify');
const hystrixSSEStream = require('hystrixjs').hystrixSSEStream;
const simplifiedHystrixjs = require('../lib/index');


function hello(name) {
  return new Promise(function(resolve, reject) {
    setTimeout(function () {
      resolve(`Hello, ${name}`)
    }, 1000);
  });
}

const serviceCommand = simplifiedHystrixjs.createCommands(hello, {name : 'HelloService'});

const app = restify.createServer({ name: 'simplified-hystrixjs' });

app.use(restify.plugins.queryParser());

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

app.listen(9000, function () {
  console.log('%s listening at %s', app.name, `${app.url}/hello?name=Jake`)
})

app.get('/hello', async (req, res) => {
  try {
    const response = await serviceCommand.hello(req.query.name);
    res.send(response)
  } catch (e) {
    console.log(e);
  }
});

app.get('/api/hystrx.stream', hystrixStreamResponse);

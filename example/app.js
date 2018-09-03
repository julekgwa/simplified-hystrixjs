const restify = require('restify');
const simplifiedHystrixjs = require('../lib/index');


function hello(name) {
  return new Promise(function(resolve, reject) {
    setTimeout(function () {
      resolve(`Hello, ${name}`)
    }, 1000);
  });
}

const serviceCommand = simplifiedHystrixjs.createHystrixCommands(hello, {name : 'HelloService'});

const app = restify.createServer({ name: 'simplified-hystrixjs' });

app.use(restify.plugins.queryParser());



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

simplifiedHystrixjs.createHystrixStream(app);

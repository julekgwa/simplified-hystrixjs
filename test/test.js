const expect = require('chai').expect;
const { createHystrixCommands } = require('../lib/index');

function hello(name) {
  return new Promise(function(resolve, reject) {
    setTimeout(function () {
      resolve(`Hello, ${name}`)
    }, 1000);
  });
}

it('Should return hystrix command instantiated with default options', () => {
  const func = createHystrixCommands(hello);

  expect(func.hello).to.be.a('function');
});

it('Throw an error if not passed a function', () => {
    expect(() => {
      brake = createHystrixCommands();
      brake.test();
    }).to.throw();
  });

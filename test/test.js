const expect = require('chai').expect;
const { createCommands } = require('../lib/index');

function hello(name) {
  return new Promise(function(resolve, reject) {
    setTimeout(function () {
      resolve(`Hello, ${name}`)
    }, 1000);
  });
}

it('Should return hystrix command instantiated with default options', () => {
  const func = createCommands(hello);

  expect(func.hello).to.be.a('function');
});

it('Throw an error if not passed a function', () => {
    expect(() => {
      brake = createCommands();
      brake.test();
    }).to.throw();
  });

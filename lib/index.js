const HttpStatus = require('http-status-codes');
const circuitBreaker = require('opossum');

/**
 * create hystrix command
 * @param  {Function} func function to execute
 * @param  {Object} service service object
 * @return {Function} returns generated hystrix command
 */
function createServiceCommand(func, service) {

  const options = {
    timeout: service && service.timeout || 3000, // If our function takes longer than 3 seconds, trigger a failure
    errorThresholdPercentage: service && service.errorThreshold || 50, // When 50% of requests fail, trip the circuit
    resetTimeout: service && service.cbsleep || 3000, // After 30 seconds, try again.
    rollingCountTimeout: service && service.statisticalWindowLength || 10000,
    rollingCountBuckets: service && service.statisticalWindowNumberOfBuckets || 10,
    name: service && service.name ? `${service.name}:${func.name}` : `${func.name}`,
    capacity: service && service.cbRequestVolume || 10,
  };

  return circuitBreaker(
    func,
    options
  );
}

/**
 * create an object of executable hystrix commands
 * @param  {Object} hystrixFunctions Objetc of hystrix functions
 * @return {Object} of executable hystrix commands
 */
function createExecutableCommands(hystrixFunctions) {
  const executeFunctions = {};
  const executeFns = Object.keys(hystrixFunctions);

  executeFns.forEach((fn) => {
    executeFunctions[fn] = async (...args) => {
      return await hystrixFunctions[fn].fire(...args);
    };
  });
  return executeFunctions;
}

/**
 * create and returns hystrix functions
 * @param  {Object} fn list of functions to generate commands for. fn can be of type Array of functions or Function
 * @param  {Object} service config service object
 * @return {Object} hystrix functions
 */
function createCommands(fn, service) {
  const hystrixFunctions = {};
  const serviceFns = Object.keys(fn);

  if (typeof fn === 'function') {
    hystrixFunctions[fn.name] = createServiceCommand(fn, service);
  } else if (Array.isArray(fn)) {
    fn.forEach((func) => {
      hystrixFunctions[func.name] = createServiceCommand(func, service);
    });
  } else if (typeof fn === 'object') {
    serviceFns.forEach((func) => {
      hystrixFunctions[func] = createServiceCommand(fn[func], service);
    });
  } else {
    return;
  }
  return createExecutableCommands(hystrixFunctions);
}


module.exports = {
  createCommands
};
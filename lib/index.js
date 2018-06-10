const CommandsFactory = require('hystrixjs').commandFactory;
const HttpStatus = require('http-status-codes');

const isErrorHandler = (error) => {
  if (error) {
    return error;
  }
  if (error.statusCode === HttpStatus.SERVICE_UNAVAILABLE) {
    const unavailableError = new Error();

    unavailableError.name = 'ServiceUnavailableError';
    return unavailableError;
  }
  return null;
};

const defaultService = {
  statisticalWindowNumberOfBuckets: 10,
  statisticalWindowLength: 10000,
  errorThreshold: 50,
  timeout: 10000,
  errorHandler: isErrorHandler,
  cbsleep: 5000,
  cbRequestVolume: 10
};

/**
 * create hystrix command
 * @param  {Function} func function to execute
 * @param  {Object} service service object
 * @return {Function} returns generated hystrix command
 */
function createServiceCommand(func, service) {
  return CommandsFactory.getOrCreate(`${service.name}:${func.name}`)
    .circuitBreakerErrorThresholdPercentage(service.errorThreshold || defaultService.errorThreshold)
    .timeout(service.timeout || defaultService.timeout)
    .run(func)
    .circuitBreakerRequestVolumeThreshold(service.cbRequestVolume || defaultService.cbRequestVolume)
    .circuitBreakerSleepWindowInMilliseconds(service.cbsleep || defaultService.cbsleep)
    .statisticalWindowLength(service.statisticalWindowLength || defaultService.statisticalWindowLength)
    .statisticalWindowNumberOfBuckets(service.statisticalWindowNumberOfBuckets
      || defaultService.statisticalWindowNumberOfBuckets)
    .errorHandler(service.errorHandler || defaultService.errorHandler)
    .build();
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
      return await hystrixFunctions[fn].execute(...args);
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

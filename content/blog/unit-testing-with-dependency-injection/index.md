---
title: Unit Testing with Dependency Injection
date: "2020-10-14"
description: "Unit testing with dependency injection enables the tester to hook into dependent modules and libraries in order to better inspect the hard-to-reach parts of a function."
---

## Summary

Unit testing with dependency injection enables the tester to hook into dependent modules and libraries in order to better inspect the hard-to-reach parts of a function.

## Unit Test Best Practices

There are varied opinions on unit test best practices. For me, the purpose of a unit test is twofold: (1) confirm expected functionality; and (2) quickly identify the location of bugs. In order to implement these goals, I subscribe to the following best practices:

- Arrange, Act, Assert
- One behavior per test
- No interdependence between tests
- Be explicit
- Abstraction: less is more

### Arrange, Act, Assert

This is the core of

### One behavior per test

### No interdependence between tests

### Be explicit

### Abstraction: less is more

## How to Unit Test with Dependency Injection

For example, the `aws sam local cli` provides the following snippet when initializing a new lambda.

```javascript
const axios = require('axios')
const url = 'http://checkip.amazonaws.com/';
let response;

exports.handler = async (event, context) => {
  try {
    const ret = await axios(url);
    response = {
      'statusCode': 200,
      'body': JSON.stringify({
          message: 'hello world',
          location: ret.data.trim()
      })
    }
  } catch (err) {
    console.log(err);
    return err;
  }

  return response
};
```

For which sam cli provides the following "unit test":

```
describe('Tests index', function () {
  it('verifies successful response', async () => {
    const result = await handler(event, context, (err, result) => {
      expect(result).to.be.an('object');
      expect(result.statusCode).to.equal(200);
      expect(result.body).to.be.an('string');

      let response = JSON.parse(result.body);

      expect(response).to.be.an('object');
      expect(response.message).to.be.equal("hello world");
      expect(response.location).to.be.an("string");
    });
  });
});
```

This fails unit test criteria in that (1) it relies on an impenetrable package; and (2) it requries integration with the internet to successfully run the happy path case.

However, both of these failings can be resolved if the function is tweaked ever-so-slightly by implementing dependency injection. In this case, dependency injection requires some basic currying.

```
const axios = require('axios')
const url = 'http://checkip.amazonaws.com/';
let response;

const handler = requestLib => async (event, context) => {
  try {
    const ret = await requestLib(url); // generalize your dependency!
    response = {
      'statusCode': 200,
      'body': JSON.stringify({
          message: 'hello world',
          location: ret.data.trim()
      })
    }
  } catch (err) {
    console.log(err);
    return err;
  }

  return response
};

module.exports = {
  handler: handler(axios), // inject your dependency to lock in usage
  testableHandler: handler, // export pre-injection version for unit testing
}
```

Here, the same handler is internally wrapped by a `requestLib`. By generalizing the request library's implementation, now the function can be invoked with any request library, not just `axios`.\* In order to enforce usage of a specific library, the function is exported with the `requestLib` set to `axios`.

But this post is about improving unit tests, not complicating functions! Dependency injection creates a hook into the request library so that it can be stubbed or spied upon.

For the happy path case, the request library's stub ought to return a value with the expected structure. In the case of `handler`, the result of the axios invocation is expected to be an object with a data property:

```
{
  data: "foobar"
}
```

The unit test setup should import the `testableHandler` and create a `requestLib` stub to substitute in for `axios`.

```
const { expect } = require('chai');
const { stub } = require('sinon');
const { testableHandler } = require('...');

let event, context;
const requestLibStub = stub().returns({ data: "foobar" });
...
```

The nice thing about a stub is that (1) its invocation parameters can inspected; and (2) its return (or resolve, or reject, etc) value can be set. By using a stub, an actual request library is no longer required for the test. Nor does the unit test attempt to reach outside of itself to the internet (or any other external integration point).

The test itself can be updated like so:

```
...
describe('Tests index', function () {
  it('verifies successful response', async () => {
    const handler = testableHandler(requestLibStub); // a handler where the external request is stubbed and therefore predictable

    const result = await handler(event, context, (err, result) => {
      // new expectations enabled!
      expect(requestLibStub.calledWith('http://checkip.amazonaws.com/')).to.equal(true); // can inspect the invocation

      expect(result).to.be.an('object');
      expect(result.statusCode).to.equal(200);
      expect(result.body).to.be.an('string');

      let response = JSON.parse(result.body);

      expect(response).to.be.an('object');
      expect(response.message).to.be.equal("hello world");
      expect(response.location).to.be.an("string");
    });
  });
});
```

Lastly, stubbing the injected dependency allows the test writer force failure in order to test negative cases.

```
...
const requestLibStubFail = stub().rejects(new Error('Oh noes!'));
...
const rejectedHandler = testableHandler(requestLibStubFail);
const result = await rejectedHandler(event, context, (err, result) => {
  // inspect the caught err
  expect(requestLibStub.calledWith('http://checkip.amazonaws.com/')).to.equal(true);
});
```

\* Provided the chosen library implements the same interface.

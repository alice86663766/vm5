adserver mock
=============

an adserver alternative whose response can be controlled by user.


## Motivation

During the development of Android, iOS and HTML5 Adplay SDK, we need to test every possible response adserver may return against SDK.

We built adserver-mock for 2 reasons:

1. in end to end test level, we do need an real HTTP server.
2. once this mock server is done, it can be used by all kind of client.

(note that every SDK can do mock in unit testing, by mocking library. but it's different level of testing)


## API Documentation

we provide an [online version](mock.adserver.vm5apis.com/docs).

or you can run a local adserver-mock, then visit [this](http://localhost:3500/docs)

besides Web API, it also provide Web UI, so it can help manually testing as well.


## Usage

the classic scenario is like:

1. configure environment, let testing target to interact with adserver-mock instead of the real adserver.
   this is often achieved by change DNS setting or set a HTTP proxy.
2. get `cid` of test target environment.
3. setup response of adserver-mock with `cid`. adserver-mock will use this `cid` to identify each client.
   you can do it via API call, or adserver-mock's Web UI
4. drive test target to interact with adserver-mock.
5. verify test target behaves like what you expected.



## Configuration

1. port can be configure via environment variable `PORT`. it's default to 3500.
2. adserver host can be configure via environment variable `adserver_host`. it's default to "http://api-adserver.vm5apis.com"

## Installation & run

directly run node.js

    npm install
    npm start


## Tests

first you need to run an local adserver-mock:
OB
    npm start
    
then you can run test against it:

    npm test



## Contributors

cades (<mailto:cades@vm5.com>)



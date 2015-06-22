require! 'harmony-reflect'
debug = require('debug')('adserver-mock:getter')

# use ES6 proxy as wildcard getter
dynamic-M = new Proxy {}, do
  get: (target, name) ->
    if name not of target
      debug "trying to access non-exist property #name with target", target
      target[name] = {}
    target[name]

static-M = do
  novm-cids: {}
  expired-cids: {}
  not-yours-cids: {}
  ws-novm-cids: {}
  timelimit-cids: {}
  download-fail-cids: {}
  pre-recorded-cids: {}
  throttled-cids: {}
  status-code-cids: {}
  broken-icon-cids: {}
  campaigns-novm-cids: {}
  terminate-ws-cids: {}

module.exports = if process.env.NODE_ENV is 'development' then dynamic-M else static-M

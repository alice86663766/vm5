require! 'koa-router': koaRouter
require! './the-matrix': M
debug = require('debug')('adserver-control:control')
{novm-cids, expired-cids, not-yours-cids, ws-novm-cids, timelimit-cids, download-fail-cids, pre-recorded-cids, throttled-cids, status-code-cids, broken-icon-cids, campaigns-novm-cids} = M

router = koaRouter!

router.get '/v3/trial/set-next-novm/:cid', (next) ->*
  {cid} = @params
  novm-cids[cid] = true
  @body = result: 'ok'

router.get '/v3/trial/set-next-expired/:cid', (next) ->*
  {cid} = @params
  expired-cids[cid] = true
  @body = result: 'ok'

router.get '/v3/trial/set-next-not-yours/:cid', (next) ->*
  {cid} = @params
  not-yours-cids[cid] = true
  @body = result: 'ok'

router.get '/v3/trial/set-next-timelimit-:n-secs/:cid', (next) ->*
  {cid, n} = @params
  timelimit-cids[cid] = +n
  @body = result: 'ok'

router.get '/v3/trial/set-next-image-link-corrupt/:cid', (next) ->*
  {cid} = @params
  download-fail-cids[cid] = true
  @body = result: 'ok'

router.get '/v3/trial/set-next-status-code-:code/:cid', (next) ->*
  {cid, code} = @params
  status-code-cids[cid] = +code
  @body = result: 'ok'

# campaign related API

router.get '/v3/campaigns/set-next-novm/:cid', (next) ->*
  {cid} = @params
  campaigns-novm-cids[cid] = true
  @body = result: 'ok'

# websocket related API

router.get '/v3/trial/set-next-novm-on-connect-ws/:cid', (next) ->*
  {cid} = @params
  ws-novm-cids[cid] = true
  @body = result: 'ok'

router.get '/v3/trial/set-next-pre-recorded/:cid', (next) ->*
  {cid} = @params
  pre-recorded-cids[cid] = true
  @body = result: 'ok'

UNLIMITED_FPS = 100

router.get '/v3/trial/set-next-throttlable/:cid', (next) ->*
  {cid} = @params
  throttled-cids[cid] = init-fps: UNLIMITED_FPS
  @body = result: 'ok'

router.get '/v3/trial/set-next-throttled-to-:initfps-fps/:cid', (next) ->*
  {cid, initfps} = @params
  throttled-cids[cid] = init-fps: initfps
  @body = result: 'ok'

router.get '/v3/trial/start-throttle-ws-to-:fps-fps/:cid', (next) ->*
  {cid, fps} = @params
  @throw 400, 'not-set-throttle' if not throttled-cids[cid]

  debug 'start throttle'
  throttled-cids[cid].max-fps = fps
  @body = result: 'ok'

router.get '/v3/trial/stop-throttle-ws/:cid', (next) ->*
  {cid} = @params
  @throw 400, 'not-set-throttle' if not throttled-cids[cid]

  debug 'stop throttle'
  throttled-cids[cid].max-fps = UNLIMITED_FPS
  @body = result: 'ok'

router.get '/v3/debug/M', ->*
  @body = M


module.exports = router.routes!

require! 'koa-route': route
require! 'koa-compose': compose
require! ws: WebSocket
require! ramda: R
require! url: URL
debug = require('debug')('adserver-mock:ws')
require! './the-matrix': {throttled-cids}

require! './video-landscape.json': landscape-video-frames
require! './video-portrait.json':  portrait-video-frames

create-pre-recorded-ws = (frames) -> ->*
  frame-count = 0
  intervalId = setInterval ~>
    if @readyState isnt WebSocket.OPEN or frame-count >= frames.length
      clearInterval intervalId
      @close!
      return
    @send new Buffer frames[frame-count], 'hex'
    frame-count++
  , 1000 / 30

corruped-video-ws = ->*
  intervalId = setInterval ~>
    if @readyState isnt WebSocket.OPEN
      clearInterval intervalId
      @close!
      return
    @send new Buffer 'This is not a valid h.264 frame'
  , 1000 / 30

proxy-ws = (next) ->*
  debug 'websocket proxy to cloud!'
  # parse & check
  {cid, orig_host} = URL.parse(@path, true).query
  settings = throttled-cids[cid]
  if not settings
    debug 'not set throttled =_='
    @close 1000, 'e04'
    return

  # create SDK ws & cloud ws
  to-sdk = @
  to-cloud = new WebSocket "ws://#orig_host#{ @path }"

  # setup cleanup
  to-sdk.on 'close', ->
    debug 'sdk ws close. also close cloud ws'
    to-cloud.close 1000, 'close ws by adserver' # shutdown the other websocket
    delete throttled-cids[cid]                  # deregister this cid

  @state = {cid, settings, to-sdk, to-cloud}
  yield next

get-first-arg = R.nth-arg 0

proxy-ctrl = (next) ->*
  {cid, settings, to-sdk, to-cloud} = @state
  to-sdk.on 'message', (data) ->
    return if to-cloud.readyState isnt WebSocket.OPEN
    to-cloud.send data
  to-cloud.on 'message', (data) ->
    return if to-sdk.readyState isnt WebSocket.OPEN
    to-sdk.send data
  settings.on 'terminate-ctrl', ->
    debug '!!!!! terminate-ctrl !!!!!'
    to-sdk.terminate!

proxy-audio = (next) ->*
  {cid, settings, to-sdk, to-cloud} = @state
  to-sdk.on 'message', (data) ->
    return if to-cloud.readyState isnt WebSocket.OPEN
    to-cloud.send data
  to-cloud.on 'message', (data) ->
    return if to-sdk.readyState isnt WebSocket.OPEN
    to-sdk.send data
  settings.on 'terminate-audio', ->
    debug '!!!!! terminate-audio !!!!!'
    to-sdk.terminate!

proxy-video = (next) ->*
  {cid, settings, to-sdk, to-cloud} = @state

  settings.max-fps = settings.init-fps
  frame-queue = []

  # we don't throttle the SDK->cloud direction, simply proxy the messages
  # frame control will use this
  to-sdk.on 'message', (data) ->
    return if to-cloud.readyState isnt WebSocket.OPEN
    to-cloud.send data

  # (producer) once receive data from cloud, put it into a buffer
  to-cloud.on 'message', get-first-arg >> frame-queue~push

  # (consumer) deque and send data to SDK according to current max-fps
  schedual-next = ->
    return if to-sdk.readyState isnt WebSocket.OPEN
    to-sdk.send frame-queue.shift! if frame-queue?.length > 0
    setTimeout schedual-next, 1000 / settings.max-fps

  # trigger schedualing. bang!
  schedual-next!

  settings.on 'terminate-video', ->
    debug '!!!!! terminate-video !!!!!'
    to-sdk.terminate!

  # free memory
  to-cloud.on 'close', ->
    frame-queue := null


module.exports = do

  handle-error: route.all '(.*)', (path, next) ->*
    try
      yield next
    catch
      debug 'error in ws: ', e

  mimic-novm-ws: route.all '/v3/mimic-novm-ws', ->*
    @close 1000, 'e0'

  pre-recorded-landscape: route.all '/v3/pre-recorded-landscape', create-pre-recorded-ws landscape-video-frames
  pre-recorded-portrait:  route.all '/v3/pre-recorded-portrait',  create-pre-recorded-ws portrait-video-frames

  corrupt-video: route.all '/v3/corrupted-video', corruped-video-ws

  # though koa-route doesn't support middleware, we can use koa-compose to implement ours
  proxy-audio: route.all '/?(.*)type=audio(.*)', ->*
    debug 'route to audio!'
    yield compose([proxy-ws, proxy-audio]).call(@)

  proxy-video: route.all '/?(.*)type=video(.*)', ->*
    debug 'route to video!'
    yield compose([proxy-ws, proxy-video]).call(@)

  proxy-ctrl: route.all '/?(.*)type=ctrl(.*)', ->*
    debug 'route to ctrl!'
    yield compose([proxy-ws, proxy-ctrl]).call(@)

require! 'koa-route': route
require! ws: WebSocket
require! url: URL
require! './the-matrix': {throttled-cids}

module.exports = do

  handle-error: route.all '(.*)', (path, next) ->*
    try
      yield next
    catch
      console.log 'error in ws: ', e

  mimic-novm-ws: route.all '/v3/mimic-novm-ws', ->*
    @close 1000, 'e0'

  pre-recorded-landscape: route.all '/v3/pre-recorded-landscape', ->*
    frames = require './video-landscape.json'
    frame-count = 0
    intervalId = setInterval ~>
      if @readyState isnt WebSocket.OPEN or frame-count >= frames.length
        clearInterval intervalId
        @close!
        return
      @send new Buffer frames[frame-count], 'hex'
      frame-count++
    , 1000 / 30

  proxy-video: route.all '/?(.*)', ->*
    console.log 'websocket proxy to cloud!'
    {cid, orig_host} = URL.parse(@path, true).query
    settings = throttled-cids[cid]
    console.log 'orig host: ', orig_host, "ws://#orig_host#{ @path }"

    if not settings
      console.log 'not set throttled =_='
      @close 1000, 'e04'
      return

    settings.max-fps = settings.init-fps
    console.log 'settings: ', settings

    # create SDK ws, cloud ws, and throttle stream
    to-sdk = @
    to-cloud = new WebSocket "ws://#orig_host#{ @path }"

    # frame queue & max-fps init
    frame-queue = []

    # we don't throttle the SDK->cloud direction, simply proxy the messages
    to-sdk.on 'message', (event) ->
      to-cloud.send event.data

    # (producer) once receive data from cloud, put it into a buffer
    to-cloud.on 'message', (event) ->
      frame-queue?.push event.data

    # (consumer) deque and send data to SDK according to current max-fps
    schedual-next = ->
      return if to-sdk.readyState isnt WebSocket.OPEN
      to-sdk.send frame-queue.shift! if frame-queue?.length > 0
      setTimeout schedual-next, 1000 / settings.max-fps

    # trigger schedualing. bang!
    schedual-next!

    # cleanup
    to-sdk.on 'close', ->
      console.log 'sdk ws close. also close cloud ws'
      to-cloud.close 1000, 'close ws by adserver' # shutdown the other websocket
      frame-queue := null                         # free memory
      delete throttled-cids[cid]                  # deregister this cid

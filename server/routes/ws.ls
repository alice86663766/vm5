require! 'koa-route': route
require! ws: WebSocket
require! url: URL
require! './the-matrix': {throttled-cids, terminate-ws-cids}

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

module.exports = do

  handle-error: route.all '(.*)', (path, next) ->*
    try
      yield next
    catch
      console.log 'error in ws: ', e

  mimic-novm-ws: route.all '/v3/mimic-novm-ws', ->*
    @close 1000, 'e0'

  pre-recorded-landscape: route.all '/v3/pre-recorded-landscape', create-pre-recorded-ws landscape-video-frames
  pre-recorded-portrait:  route.all '/v3/pre-recorded-portrait',  create-pre-recorded-ws portrait-video-frames

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
    frame-queue = []

    # create SDK ws & cloud ws
    to-sdk = @
    to-cloud = new WebSocket "ws://#orig_host#{ @path }"

    # we don't throttle the SDK->cloud direction, simply proxy the messages
    # frame control will use this
    to-sdk.on 'message', (data) ->
      to-cloud.send data

    # (producer) once receive data from cloud, put it into a buffer
    to-cloud.on 'message', (data) ->
      frame-queue.push data

    # (consumer) deque and send data to SDK according to current max-fps
    schedual-next = ->
      return if to-sdk.readyState isnt WebSocket.OPEN
      return to-sdk.terminate! if delete terminate-ws-cids[cid]
      to-sdk.send frame-queue.shift! if frame-queue?.length > 0
      setTimeout schedual-next, 1000 / settings.max-fps

    # trigger schedualing. bang!
    schedual-next!

    # cleanup
    to-sdk.on 'close', ->
      console.log 'sdk ws close. also close cloud ws'
      to-cloud.close 1000, 'close ws by adserver' # shutdown the other websocket
      delete throttled-cids[cid]                  # deregister this cid

    # free memory
    to-cloud.on 'close', ->
      frame-queue := null

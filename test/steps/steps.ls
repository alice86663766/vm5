# 謹記 SUT 與抽象層的概念
# glue code 跟 SUI 要分離

# The library that I wish to test
require! '../lib/server-mock': ServerMock

# test framework & assetion lib
require! yadda: Yadda
English = Yadda.localisation.English
require! chai
{expect} = chai
chai.use require 'chai-subset'
chai.use require 'chai-as-promised'

# other utils
require! bluebird: Promise
require! request
request = Promise.promisify request
require! ws: WebSocket

parseValue = (value) ->
  eval "var __parsedValue = #{value}"
  value = __parsedValue
  __parsedValue = undefined
  value

server = new ServerMock

frames-count = 0
timeup-frames-count = 0
video-ws = null

dictionary = new Yadda.Dictionary!
.define 'api', /(\S*)/
.define 'json', /(.*)/
.define 'n', /(\d+)/
.define 'code', /(\d+)/

module.exports = English.library dictionary

.given "reset status", (next) ->
  server.call-api('/v3/reset').finally (-> next!)

.when "I call $api", (api, next) ->
  server.call-api(api).finally (-> next!)

.when "I successfully call $api", (api, next) ->
  server.call-api(api)
  .then server.last-resp-code
  .then (code) ->
    expect(code).to.equal 200
    next!
  .catch (e) ->
    next e

.then "I expect response of trial to contain $json", (json, next) ->
  expect(server.call-trial!).to.eventually
  .containSubset(parseValue json).notify next

.then "I expect response status code to be $code", (code, next) ->
  code = parseInt code
  server.last-resp-code!
  .then (resp-code) ->
    expect(resp-code).to.equal code
    next!
  .catch (e) ->
    next e

.then "I expect response status code of trial to be $code", (code, next) ->
  code = parseInt code
  server.call-trial!
  .then server.last-resp-code
  .then (resp-code) ->
    expect(resp-code).to.equal code
    next!
  .catch (e) ->
    next e

.then "I expect response of trial contains a corrupt image link", (next) ->
  server.call-trial!
  .then (cmp) -> request cmp.icon
  .then -> next 'success to get image'
  .catch -> next!

.then "I expect the video ws close immediately", (next) ->
  server.call-trial!
  .then server.connect-video-ws
  .then (ws) ->
    ws.on 'close', (code, reason) ->
      expect(code).to.equal 1000
      expect(reason).to.equal 'e0'
      next!

.when "^I connect video ws of trial for $n seconds?$", (n, next) ->
  frames-count := 0
  timeup-frames-count := 0
  n = parseInt n
  server.call-trial!
  .then server.connect-video-ws
  .then (ws) -> new Promise (resolve, reject) ->
    ws.on 'message', (msg) ->
      frames-count++
      try
        expect(msg).to.be.not.empty
        return if frames-count > 1
        Promise.delay(1000 * n).then ->
          timeup-frames-count := frames-count
          ws.close!
          resolve true
      catch e
        reject e
  .then -> next!
  .catch (e) -> next e

.when "^I connect video ws of trial for $n seconds? with last $n seconds? throttled to $n fps$", (total-sec, throttled-sec, fps, next) ->
  total-sec = parseInt total-sec
  throttled-sec = parseInt throttled-sec
  fps = parseInt fps
  frames-count := 0
  timeup-frames-count := 0
  server.call-trial!
  .then server.connect-video-ws
  .then (ws) -> new Promise (resolve, reject) ->
    ws.on 'message', (msg) ->
      frames-count++
      try
        expect(msg).to.be.not.empty
        return if frames-count > 1
        Promise.delay(1000 * total-sec).then ->
          timeup-frames-count := frames-count
          ws.close!
          resolve true
        Promise.delay(1000 * (total-sec - throttled-sec)).then ->
          server.call-api "/v3/trial/start-throttle-ws-to-#{fps}-fps"
          .then server.last-resp-code
          .then (code) -> expect(code).to.equal 200
      catch e
        reject e
  .then -> next!
  .catch (e) -> next e

.when "^I connect video ws of trial for $n seconds? with last $n seconds? stop throttle$", (total-sec, stop-throttled-sec, next) ->
  total-sec = parseInt total-sec
  stop-throttled-sec = parseInt stop-throttled-sec
  fps = parseInt fps
  frames-count := 0
  timeup-frames-count := 0
  server.call-trial!
  .then server.connect-video-ws
  .then (ws) -> new Promise (resolve, reject) ->
    ws.on 'message', (msg) ->
      frames-count++
      try
        expect(msg).to.be.not.empty
        return if frames-count > 1
        Promise.delay(1000 * total-sec).then ->
          timeup-frames-count := frames-count
          ws.close!
          resolve true
        Promise.delay(1000 * (total-sec - stop-throttled-sec)).then ->
          server.call-api "/v3/trial/stop-throttle-ws"
          .then server.last-resp-code
          .then (code) -> expect(code).to.equal 200
      catch e
        reject e
  .then -> next!
  .catch (e) -> next e

.when "^I connect video ws$", (next) ->
  server.call-trial!
  .then server.connect-video-ws
  .then (ws) -> video-ws := ws
  .then -> next!
  .catch (e) -> next e

.then "I expect about $n \\+\\- $n frames received", (n, offset, next) ->
  n = +n
  offset = +offset
  expect(timeup-frames-count).to.be.within n - offset, n + offset
  next!

.then "I expect response to contain $json", (json, next) ->
  server.last-resp-body!
  .then (body) -> expect(body).to.containSubset parseValue json
  .then -> next!
  .catch (e) -> next e

.then "^I expect all campaigns of response contain $json$", (json, next) ->
  server.call-campaigns!
  .then (campaigns) ->
    campaigns.forEach (cmp) ->
      expect(cmp).to.containSubset(parseValue json)
    next!
  .catch (e) -> next e

.then "the ws is closed with code $n when I successfully call $api", (expected-code, api, next) ->
  video-ws.on 'close', (code, message) ->
    expect(code).to.equal +expected-code
    video-ws := null
    next!

  Promise.delay(1000).then -> server.call-api(api)
  .then server.last-resp-code
  .then (code) -> expect(code).to.equal 200
  .catch (e) -> next e

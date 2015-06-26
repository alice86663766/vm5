require! bluebird: Promise
require! ws: WebSocket
require! request
require! assert
request = Promise.promisify request

class FakeServer
  host = 'localhost:3500'
  endpoint: "http://#host"
  cid = 'xxx'
  last-request: null
  call-api: (api) ~>
    @last-request = request url: "#{@endpoint}#api/#cid", json: true
    @last-resp-body!
  last-resp-code: ~>
    @last-request.spread (resp, body) -> resp.statusCode
  last-resp-body: ~>
    @last-request.spread (resp, body) -> body
  call-trial: ~>
    @last-request = request do
      method: 'post'
      url: "#{@endpoint}/v3/trial"
      headers:
        'Content-Type': 'application/json'
        'VM5-Api-Token': 'DRriVum2AbTUxEso1fgczFf5mkLa8l75'
        'VM5-Cid': cid
      json: true
      body:
        ad_id: "apk-fruitninja"
        sid: "xxx"
    @last-resp-body!
  call-campaigns: ~>
    @last-request = request do
      url: "#{@endpoint}/v3/campaigns"
      headers:
        'Content-Type': 'application/json'
        'VM5-Api-Token': 'DRriVum2AbTUxEso1fgczFf5mkLa8l75'
        'VM5-Cid': cid
      json: true
    @last-resp-body!
  connect-video-ws: ~>
    @last-resp-body!
    .then (cmp) -> new WebSocket cmp.streams.video_ws
  connect-audio-ws: ~>
    @last-resp-body!
    .then (cmp) -> new WebSocket cmp.streams.audio_ws
  connect-ctrl-ws: ~>
    @last-resp-body!
    .then (cmp) -> new WebSocket cmp.streams.ctrl_ws

module.exports = FakeServer

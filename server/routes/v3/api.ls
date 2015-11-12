require! './proxy'
require! 'http-status'
require! bluebird: Promise
require! '../the-matrix': M
require! url: URL
debug = require('debug')('adserver-mock')
{novm-cids, expired-cids, not-yours-cids, ws-novm-cids, timelimit-cids, download-fail-cids, pre-recorded-cids, throttled-cids, status-code-cids, delay-cids, broken-icon-cids, campaigns-novm-cids, corrupted-video-cids} = M

module.exports = do

  '/v3/trial':

    # cid 要要求大家送嗎? 或者用 ip + ua 拼一個 unique id 就好? 自己 gen, 帶在 cookie 裡
    # 或者, 看到 VM5-Cid 就用, 若否則採用 cookie, 再次則使用 ip+ua
    # 重點是, 發 req 的人可能不同! 相同的情況: demo app + SDK
    # 不同的情況: test code + SDK, 或是 test code + H5 SDK.
    # 總之不管是 cid 還是 cookie, demo app / page 都必須取得，並印出來，讓 appium 抓到.
    #
    # cookie 應該是不 work 的. 試想, 先去套招的 test code 取得 cookie, 要怎麼 pass 給 SDK? 無法.
    # SDK 會取得另一個 cookie. 哭哭. 除非套招都由 test app 做, 但不太實際吧!
    # 結論: cid 還是最佳解. 要求每個 request 都帶 cid 吧!
    #
    # 另一個方向是, adserver mock 一次只服務一個人
    # 不過這樣等於要求要測試的人要自己架 nginx + node
    #
    # 或者提供 web 介面, 讓測試者看看 SDK 送出的 request 會轉換成什麼 unique id.
    # 但 test code 會很難處理
    #
    # 先用 cid 吧, 至少 app11 的 case 不用動 SDK

    function* wrap-process (next)
      debug "ip = #{@ip}"

      # pre process
      cid = @headers.'vm5-cid' or 'xx'

      if code = delete status-code-cids[cid]
        @status = code
        @body = message: http-status[code]
        return

      if n = delete delay-cids[cid]
        yield Promise.delay n * 1000

      if delete novm-cids[cid]
        @status = 404
        @body = error: true, message: 'fail to request vm'
        return

      if delete expired-cids[cid]
        @status = 404
        @body = error: true, message: 'this ad is expired'
        return

      if delete not-yours-cids[cid]
        @status = 404
        @body = error: true, message: 'you do not have this ad'
        return

      yield next # hand off to proxy

      # post process
      if tl = delete timelimit-cids[cid]
        @body.time_limit = tl

      if delete ws-novm-cids[cid] and ss = @body.streams
        ss.video_ws = ss.audio_ws = ss.ctrl_ws = "ws://#{@host}/v3/mimic-novm-ws"

      if delete download-fail-cids[cid]
        @body.icon = @body.background = @body.blur = 'http://gg.img'

      if delete pre-recorded-cids[cid] and ss = @body.streams
        ss.video_ws = "ws://#{@host}/v3/pre-recorded-#{@body.orientation}"

      if delete corrupted-video-cids[cid] and ss = @body.streams
        ss.video_ws = "ws://#{@host}/v3/corrupted-video"

      if throttled-cids[cid] and ss = @body.streams
        for type in ['video' 'audio' 'ctrl']
          key = type + '_ws'
          {path, host} = URL.parse ss[key]
          ss[key] = "ws://#{ @host + path }&cid=#{ encodeURIComponent cid }&orig_host=#{ encodeURIComponent host }&type=#{ encodeURIComponent type }"
        debug ss

    proxy('/v3/trial')

  '/v3/campaigns':

    function* wrap-process (next)
      cid = @headers.'vm5-cid' or 'xx'

      yield next

      if delete campaigns-novm-cids[cid]
        # I don't know why body parser not working here
        # so I have to explicitly parse body
        @body = JSON.parse @body
        @body.for-each (cmp) -> cmp.ready = 0

    proxy('/v3/campaigns')

  '/v3/campaigns/:ad_id':

    function* wrap-process (next)
      cid = @headers.'vm5-cid' or 'xx'

      yield next

      if delete campaigns-novm-cids[cid]
        # I don't know why body parser not working here
        # so I have to explicitly parse body
        @body = JSON.parse @body
        @body.ready = 0

    proxy('/v3/campaigns/:ad_id')

  '/v3/ping': [
    proxy('/v3/ping')
  ]

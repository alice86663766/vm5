require! koa
require! 'koa-router': koaRouter
require! 'koa-bodyparser': bodyParser
require! 'koa-body': body
require! 'koa-pixie-proxy': pixie
require! 'http-status'
require! 'koa-send': send

host = 'materials.adplay.vm5apis.com'
adserver-host = process.env.materials_host or "https://#host"
proxy = pixie host: adserver-host

app = koa!
router = koaRouter!

resp-flags = {}

#
# control
#

router.get '/v3/materials/set-next-502', (next) ->*
  resp-flag.'bad-gatway' = true
  @body = result: 'ok'

router.get '/v3/materials/set-next-zip-corrupted', (next) ->*
  resp-flag.'zip-corrupted' = true
  @body = result: 'ok'

#
# proxy & modify
#

router.get '/v1/common/:SDK_version', proxy!
router.get '/dl/common/:SDK_version/:material_version',

  (next) ->*
    if delete resp-flags['bad-gatway']
      console.log 'bad-gatway!'
      @status = 502
      @body = message: http-status[code]
      return

    if delete resp-flags['zip-corrupted']
      console.log 'zip-corrupted!'
      yield send @, __dirname + '/bad.zip'
      return

    yield next
    console.log @headers, @response.header
    console.log @response.length
    console.log typeof @body

  proxy!

app
  .use body!
  .use router.routes!

module.exports = app
module.exports.host = host

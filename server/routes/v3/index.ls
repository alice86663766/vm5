require! 'koa-router': koaRouter
require! './api'

router = koaRouter!
[get, post] = ['get' 'post']

defroute = (verb, path) ->
  router[verb] path, ...api[path]

defroute post, '/v3/trial'
defroute get,  '/v3/campaigns'
defroute get,  '/v3/campaigns/:ad_id'

module.exports = router.routes!

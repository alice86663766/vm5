require! 'koa-router': koaRouter
require! aglio
require! fs
debug = require('debug')('adserver-mock:doc')
router = koaRouter!


blueprint = fs.readFileSync "#__dirname/../../API_blueprint.md", encoding: 'utf8'
template = 'default'

doc = ''

aglio.render blueprint, template, (err, html, warnings) ->
  return debug err if err
  debug warnings if warnings
  doc := html

router.get '/docs', ->*
  @body = doc

module.exports = router.routes!

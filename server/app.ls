require! koa
require! './routes'
require! 'koa-bodyparser': bodyParser
require! 'koa-websocket': websockify

app = module.exports = websockify koa!
app
  .use (next) ->*
    try
      yield next
    catch
      @status = e.status || 500
      @body = error: true, message: e.message
      @app.emit 'error', e, @
  .use bodyParser jsonLimit: '2000mb'
  .use routes.control
  .use routes.wrapped
  .use routes.doc

app.ws.use routes.ws.handle-error
app.ws.use routes.ws.mimic-novm-ws
app.ws.use routes.ws.pre-recorded-landscape
app.ws.use routes.ws.proxy-video

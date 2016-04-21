# entry point, gatewat, whatever.
# get apps (no matter they are written in express or koajs),
# mount them together, into a single web server

require! livescript
require! './app'

env = process.env

port = env.PORT or 3500
app.listen port
console.log "Listening on port #port"

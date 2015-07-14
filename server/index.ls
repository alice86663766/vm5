# entry point, gatewat, whatever.
# get apps (no matter they are written in express or koajs),
# mount them together, into a single web server

require! livescript
require! [fs, './config', './app']

env = process.env

if env.PORT
  port = env.PORT
  app.listen port
  console.log "Listening on port #port"
else
  {domain-socket} = config
  app.listen domain-socket
  fs.chmod domain-socket, '777'
  console.log "Listening on domain socket #domain-socket"

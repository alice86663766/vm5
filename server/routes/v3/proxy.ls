require! 'koa-pixie-proxy': pixie
adserver-host = process.env.adserver_host or 'http://api.adserver.vm5apis.com'
proxy = module.exports = pixie host: adserver-host

# VM5 Dashboard Base Project

## Client

### Prerequisite

* nodejs or iojs
* npm

### Installation

```
$ npm install -g gulp
$ npm install
$ npm dedupe 
$ gulp
```

## Docker

### Mac OSX

#### Prerequisite

* docker-machine
* docker

First setup a new docker machine,

```
$ docker-machine create --driver virtualbox dev
$ docker-machine stop dev
$ VBoxManage modifyvm dev --natpf1 "tcp-port-dashboard,tcp,,8000,,8000"
$ docker-machine start dev
```

#### Build

```
$ docker build -t dashboard .
```

#### Run

There are 2 major mode to run server: production mode and development mode.
The former use normal server, while the latter use gulp-live-server.
See detail in services-diagram.jpg

##### docker with mongodb installed on host

In docker, 'localhost' means container itself, which do not install mongodb.
We probably want to connect the mongodb hosted on our host OS, the following
section states how to do this:

1. make sure mongodb config bind ip to 0.0.0.0
2. find local IP with `ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1`

now you get `localip`.
In following paragraph, if you see `<mongodburl>`, replace it with `"mongodb://<localip>/mydb"`

##### server modes

There are 4 modes to start a server:

1. production mode

    stable and fast.
    fire up by supervisord, listen on domain socket, proxied to nginx.

    ```
    $ docker run -d -p 8000:80 --name dashboard dashboard \
    -e NODE_ENV=production -e MONGODB=<mongodburl>
    ```

2. development mode

    developer friendly environment.
    fire up by gulp-live-server. auto restart on server file change.
	classic livereload on client file change.

    ```
    $ docker run -d -p 8000:80 --name dashboard-dev dashboard \
    -v /path/to/dashboard/public:/dashboard/public \
    -v /path/to/dashboard/server:/dashboard/server \
    -e NODE_ENV=production -e MONGODB=<mongodburl>
    ```

    you can see gulp task log using command:

    ```
    docker exec -it dashboard-dev supervisorctl tail -f dashboard-server
    ```

3. testing mode

    run server test suite once

    ```
    $ docker run -it -e NODE_ENV=test -e MONGODB=<mongodburl> dashboard /run_server.sh
    ```

4. autotesting mode

    automatically run server test, on each server file change.

    ```
    $ docker run -it -e NODE_ENV=autotest -e MONGODB=<mongodburl> dashboard /run_server.sh
    ```

##### brower side live reload

We support 2 livereload tool: classic livereload &  browser-sync.
Both of them can be used in conjunction with "development mode server" or "production mode server".


To run classic live reload (with chrome plugin), run the following command:

`gulp livereload`

or it's alias

`gulp watch`

To run browser-sync, run the following command:

`gulp browser-sync`

browser-sync will proxy port 8000. If you want to specify which port to proxy, use this:

`PORT=7000 gulp watch`

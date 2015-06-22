FORMAT: 1A
HOST: http://mock.adserver.vm5apis.com/

# vm5 adserver mock

AdServer Mock is a proxy server to adserver, with extra ability to modify the repsonse, for re-producing error response or bad network environment.  
It provide a set of API for 

1. control and modify the reponse of next `/v3/trial` or `/v3/campaigns/` call against specific cid
2. throttle and unthrottle video websocket

## usage

redirect all of the API calls that originally from SDK to adserver, to adserver mock.  
You can achieve that via DNS setting on your latpot (the HTML5 case), or via the 'Wifi Settings' app (the Android case). Directly edit `/etc/hosts` file is an option, too. No matter what approach you choose, the ultimate goal is **let SDK send request to adserver mock**.

To run a local one, just clone this repo and type the following commands:

`npm install`
`npm start`

# Group Control Trial

Control the next response of trial.  
These APIs all take a `cid` parameter, which indicate the adserve mock to do something if it see the next call to `/v3/trial/` with the same cid.

## no vm [/v3/trial/set-next-novm/:cid]

### set no vm of this ad [GET]


+ Response 200 (application/json)

            { "result": "ok" }

## expired [/v3/trial/set-next-expired/:cid]

### set ad expired [GET]


+ Response 200 (application/json)

            { "result": "ok" }

## not yours [/v3/trial/set-next-not-yours/:cid]

### set ad not yours [GET]


+ Response 200 (application/json)

            { "result": "ok" }

## set time limit [/v3/trial/set-next-timelimit-:n-secs/:cid]

### set time limit to n seconds  [GET]


+ Response 200 (application/json)

            { "result": "ok" }

## corrupt image link [/v3/trial/set-next-image-link-corrupt/:cid]

### set background & icon image link corrupt [GET]


+ Response 200 (application/json)

            { "result": "ok" }

## HTTP response code [/v3/trial/set-next-status-code-:code/:cid]

### set HTTP response code [GET]


+ Response 200 (application/json)

            { "result": "ok" }


## Group Control Campaigns

Control the response of next call to `/v3/campaigns/` or `/v3/campaigns/:ad_id`
These APIs all take a `cid` parameter, which indicate the adserve mock to do something if it see the next call to `/v3/trial/` with the same cid.

## no vm [/v3/campaigns/set-next-novm/:cid]

### set ready number to 0 [GET]


+ Response 200 (application/json)

            { "result": "ok" }

## Group WebSocket

## no vm [/v3/trial/set-next-novm-on-connect-ws/:cid]

Tell the video websocket to mimic the behavior of streaming gateway when there's no ready VM.
Close by server side on connect, with code `1000` and reason `"e0"`.

### set no vm [GET]


+ Response 200 (application/json)

            { "result": "ok" }

## pre-recorded [/v3/trial/set-next-pre-recorded/:cid]

Instead of really connect to cloud and occupies a VM, use a pre-recorded video content.
This saves cloud resource and reduce network impact, however it's more non-realistic and non-interactive.

### use pre-recorded video [GET]


+ Response 200 (application/json)

            { "result": "ok" }

## throttable [/v3/trial/set-next-throttlable/:cid]

Make the video websocket throttable. If this API is called before call `/v3/trial`, then
you can call other APIs to throttle/unthrottle the video websocket.

### set video ws throttable [GET]


+ Response 200 (application/json)

            { "result": "ok" }

## throttable with init fps [/v3/trial/set-next-throttled-to-:initfps-fps/:cid]

Make the video websocket throttable with init fps.

### set video ws throttable [GET]


+ Response 200 (application/json)

            { "result": "ok" }

## throttle to specific fps [/v3/trial/start-throttle-ws-to-:fps-fps/:cid]

Set the fps of video websocket. The normal fps is 30, so if you set it to a value smaller than 30,
you can simulate the condition that network is bad.

### set video fps [GET]

+ Response 200 (application/json)

            { "result": "ok" }

+ Response 400 (application/json)

    You will get 400 if you didn't call `/v3/trial/set-next-throttlable` or `/v3/trial/start-throttle-ws-to-:fps-fps` first.

    + Body

            {
                "error": true,
                "message": ""not-set-throttle
			}

## unthrottle [/v3/trial/stop-throttle-ws/:cid]

Set the fps of video websocket to unlimited. Note you may expirence a 'response peak' in short time.

### reset video fps [GET]

+ Response 200 (application/json)

            { "result": "ok" }

+ Response 400 (application/json)

    You will get 400 if you didn't call `/v3/trial/set-next-throttlable` or `/v3/trial/start-throttle-ws-to-:fps-fps` first.

    + Body

            {
                "error": true,
                "message": ""not-set-throttle
			}

## terminate websocket [/v3/trial/terminate-ws/:cid]

Immediately shuts down the connection. Client will receive close event with code 1006.

### terminate ws [GET]

+ Response 200 (application/json)

            { "result": "ok" }

+ Response 400 (application/json)

    You will get 400 if you didn't call `/v3/trial/set-next-throttlable` or `/v3/trial/start-throttle-ws-to-:fps-fps` first.

    + Body

            {
                "error": true,
                "message": ""not-set-throttle
			}


### Group Auxiliry APIs

## debug [/v3/debug/M]

Dump the control flag map.

### dump control flag map [GET]

+ Response 200 (application/json)

            {
                "novmCids": {},
                "expiredCids": {},
                "notYoursCids": {},
                "wsNovmCids": {},
                "timelimitCids": {},
                "downloadFailCids": {},
                "preRecordedCids": {},
                "throttledCids": {
                    "xxx": {
                        "initFps": 100
                    }
				},
                "statusCodeCids": {},
                "brokenIconCids": {},
                "campaignsNovmCids": {}
            }

## reset control status [/v3/reset/:cid]

clear specific cid on control flag map.

### rest specific cid's control status [GET]

+ Response 200 (application/json)

            { "result": "ok" }


Feature: adserver mock API

Scenario Outline: set next trial [name]
  When I successfully call [api]
  Then I expect response of trial to contain [response]

  Examples:
    | name      | api                                  | response                                          |
    | no vm     | /v3/trial/set-next-novm              | {error: true, message: 'fail to request vm'}      |
    | expired   | /v3/trial/set-next-expired           | {error: true, message: 'this ad is expired'}      |
    | not yours | /v3/trial/set-next-not-yours         | {error: true, message: 'you do not have this ad'} |
    | 10 sec    | /v3/trial/set-next-timelimit-10-secs | {time_limit: 10}                                  |
    | 5 sec     | /v3/trial/set-next-timelimit-5-secs  | {time_limit: 5}                                   |

Scenario Outline: set next trial status code [code]
  When I successfully call /v3/trial/set-next-status-code-[code]
  Then I expect response status code of trial to be [code]

  Examples:
    | code |
    |  500 |
    |  502 |
    |  504 |

Scenario: set next trial image link corrupt
  When I successfully call /v3/trial/set-next-image-link-corrupt
  Then I expect response of trial contains a corrupt image link

# campaign related tests

Scenario: set next campaign no vm
  When I successfully call /v3/campaigns/set-next-novm
  Then I expect all campaigns of response contain {ready : 0}

# websocket related tests

Scenario: set next trial no vm on connect ws
  When I successfully call /v3/trial/set-next-novm-on-connect-ws
  Then I expect the video ws close immediately

Scenario: pre-recorded video websocket works
  When I successfully call /v3/trial/set-next-pre-recorded
  And I connect video ws of trial for 2 seconds
  Then I expect about 60 +- 5 frames received

Scenario: set next trial throttable
  When I successfully call /v3/trial/set-next-throttlable
  And I connect video ws of trial for 3 seconds with last 2 seconds throttled to 10 fps
  Then I expect about 50 +- 10 frames received

Scenario: start throttle but not set throttable
  When I call /v3/trial/start-throttle-ws-to-10-fps
  Then I expect response to contain {error: true, message: 'not-set-throttle'}

Scenario: set next trial init fps
  When I successfully call /v3/trial/set-next-throttled-to-10-fps
  And I connect video ws of trial for 3 seconds
  Then I expect about 30 +- 3 frames received

Scenario: stop throttle
  When I successfully call /v3/trial/set-next-throttled-to-10-fps
  And I connect video ws of trial for 5 seconds with last 3 seconds stop throttle
  Then I expect about 150 +- 15 frames received


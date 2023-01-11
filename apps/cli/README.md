# Google Translate IP / Host Checker

First, install it globally:

```zsh
npm i -g @hcfy/check-google-translate-ip-cli
```

Check if multiple IP / Host are available:

```text
$ ggc 172.253.114.90,172.217.203.90,142.250.4.90,www.baidu.com,translate.amz.wang,gtranslate.cdn.haah.net
Please wait a moment, this may take a little time (up to 10 seconds)...
┌─────────┬───────────────────────────┬───────────┬─────────────┬───────────────┬─────────────────────────────────────────────────────────┐
│ (index) │         IP / Host         │ Available │ Status Code │ Response time │                   Why not available?                    │
├─────────┼───────────────────────────┼───────────┼─────────────┼───────────────┼─────────────────────────────────────────────────────────┤
│    0    │   'translate.amz.wang'    │   'Yes'   │     200     │    '868ms'    │                          'N/A'                          │
│    1    │     '172.217.203.90'      │   'Yes'   │     200     │    '889ms'    │                          'N/A'                          │
│    2    │     '172.253.114.90'      │   'Yes'   │     200     │   '1222ms'    │                          'N/A'                          │
│    3    │      'www.baidu.com'      │   'No'    │     404     │     'N/A'     │              'The status code is not 200.'              │
│    4    │ 'gtranslate.cdn.haah.net' │   'No'    │    'N/A'    │     'N/A'     │ 'An error occurred during the request: read ECONNRESET' │
│    5    │      '142.250.4.90'       │   'No'    │    'N/A'    │     'N/A'     │            'No response within 10 seconds.'             │
└─────────┴───────────────────────────┴───────────┴─────────────┴───────────────┴─────────────────────────────────────────────────────────┘
```

Load the IP / Host to be checked from the file:

```text
$ ggc -f ips.txt
```

Load the IP / Host to be checked from URL:

```text
$ ggc -u https://raw.githubusercontent.com/hcfyapp/google-translate-cn-ip/main/ips.txt
Please wait a moment, this may take a little time (up to 10 seconds)...
...
```

When loading the IP from the URL, you can specify to download this file through a proxy:

```text
$ export $https_proxy=http://example.com
$ ggc -u https://raw.githubusercontent.com/hcfyapp/google-translate-cn-ip/main/ips.txt
This proxy will be used to download file: http://example.com
It will not be used to check if the IP / Host is available.

Please wait a moment, this may take a little time (up to 10 seconds)...
...
```

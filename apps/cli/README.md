# Google Translate IP / Host Checker

## Install

First, install it globally:

```zsh
npm i -g @hcfy/check-google-translate-ip-cli
```

Note: Please turn off the TUN / TAP mode of the proxy software before use, otherwise it may go through the proxy when detecting whether the IP is available, which will lead to inaccurate test results.

## Usage

### Detects the list of IPs within this URL: https://unpkg.com/@hcfy/google-translate-ip/ips.txt

Equivalent to running `ggc -u https://unpkg.com/@hcfy/google-translate-ip/ips.txt`.

```text
$ ggc
Downloading the file from https://unpkg.com/@hcfy/google-translate-ip/ips.txt
Done.

Start detecting. This takes a little time, up to 10 seconds.
...
```

### Check if multiple IP / Host are available

```text
$ ggc 172.253.114.90,172.217.203.90,142.250.4.90,www.baidu.com,translate.amz.wang,gtranslate.cdn.haah.net
Start detecting. This takes a little time, up to 10 seconds.
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

### Load the IP / Host to be checked from a file

IP addresses / host in ips.txt need to be separated by line breaks.

```text
$ ggc -f ips.txt
Loading file...
Done.

Start detecting. This takes a little time, up to 10 seconds.
...
```

### Load the IP / Host to be checked from URL

```text
$ ggc -u https://unpkg.com/@hcfy/google-translate-ip/ips.txt
Downloading the file from https://unpkg.com/@hcfy/google-translate-ip/ips.txt
Done.

Start detecting. This takes a little time, up to 10 seconds.
...
```

When loading the IP from the URL, you can specify to download this file through a proxy:

```text
$ export $https_proxy=http://example.com
$ ggc -u https://raw.githubusercontent.com/hcfyapp/google-translate-cn-ip/master/packages/google-translate-ip/ips.txt
This proxy will be used to download file: http://example.com
It will not be used to check if the IP / Host is available.

Downloading the file from https://raw.githubusercontent.com/hcfyapp/google-translate-cn-ip/master/packages/google-translate-ip/ips.txt
Done.

Start detecting. This takes a little time, up to 10 seconds.
...
```

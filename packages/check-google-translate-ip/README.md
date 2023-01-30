# check-google-translate-ip

Determines if a specific IP or Host can be used by Google Translate.

## Usage

First, install this module:

```zsh
npm i @hcfy/check-google-translate-ip
```

Then:

```js
import { check, checkAll } from '@hcfy/check-google-translate-ip'

// check IP
check('123.232.345.90').then((result) => {
  console.log(result)
})

// check mirror host
check('mirror-for-google-translate.com').then((result) => {
  console.log(result)
})

// Specifies the timeout period in milliseconds, defaults to 10 seconds.
check('mirror-for-google-translate.com', 1000).then((result) => {
  console.log(result)
})

// Check multiple hosts
checkAll(['123.232.345.90', 'mirror-for-google-translate.com'], {
  timeout: 1000,
}).then((resultArray) => {
  console.log(resultArray)
})

// By default, `checkAll` will sort the detection results, ranking the hosts with the shortest response times first.
// You can customize the sorting function, or pass `null` to not sort.
checkAll(['123.232.345.90', 'mirror-for-google-translate.com'], {
  sorter: (resultA, resultB) => resultA.host.length - resultB.host.length,
})
```

Detection of IPv6 addresses is not currently supported.

`result` has the following properties:

- `result.host`: String.
- `result.valid`: Boolean, `true` if available.
- `result.time`: Number, exists only when `result.valid` is `true`. Response time in milliseconds.
- `result.timeout`: Boolean, `true` if the reason for unavailability is that there is no response after the timeout period.
- `result.statusCode`: Number. When this attribute is exist, it means that the IP / Host is not available because it returns a response code other than 200.
- `result.error`: When this attribute is exist, it means that the IP / Host is not available because an error occurred during the request.

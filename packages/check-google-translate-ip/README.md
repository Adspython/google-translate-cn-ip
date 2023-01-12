# check-google-translate-ip

Determines if a specific IP or Host can be used by Google Translate.

## Usage

First, install this module:

```zsh
npm i @hcfy/check-google-translate-ip
```

Then:

```js
import { check } from '@hcfy/check-google-translate-ip'

// check IP
check('123.232.345.90').then(status => {
  console.log(status)
})

// check mirror host
check('mirror-for-google-translate.com').then(status => {
  console.log(status)
})

// Specifies the timeout period in milliseconds, defaults to 10 seconds.
check('mirror-for-google-translate.com', 1000).then(status => {
  console.log(status)
})
```

`status` has the following properties:

- `status.valid`: Boolean, `true` if available.
- `status.time`: Number, exists only when `status.valid` is `true`. Response time in milliseconds.
- `status.timeout`: Boolean, `true` if the reason for unavailability is that there is no response after the timeout period.
- `status.statusCode`: Number. When this attribute is exist, it means that the IP / Host is not available because it returns a response code other than 200.
- `status.error`: When this attribute is exist, it means that the IP / Host is not available because an error occurred during the request.

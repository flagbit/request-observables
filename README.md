# Request Observables

RequestObservables is a **very** thin wrapper around node's http-clients in
`http` and `https` packages.

## Install

```bash
yarn add @flagbit/request-observables
```

## How to use?

```typescript
import { RequestObservables } from '@flagbit/request-observables';

const data = {
  some: 'data'
};

const url = 'http://somedomain.tld/some/path';

RequestObservables.post(url, data).subscribe(res => {
  console.log('### response is', res);
});
```

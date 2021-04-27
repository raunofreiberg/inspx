![image](/www/public/og.png)

## inspx

![npm](https://img.shields.io/npm/v/inspx?style=flat&colorA=000000&colorB=000000)

Pixel perfect layout inspection.

> Built for React as a proof of concept.

## Setup

Install the package:

```sh
npm install inspx --save-dev
```

Wrap the root of your application or arbitrary component trees:

```tsx
import Inspect from 'inspx';

<Inspect>
  <App />
</Inspect>
```

## Usage

Inspect elements by hovering an element and holding <kbd>Option (⌥)</kbd> simultaneously.

![demo](/public/demo.gif)

By default, any element with padding, margin, or width and height is inspectable.

You can disable certain properties:

```tsx
<Inspect 
  margin 
  size={false} 
  padding={false}
>
  <App />
</Inspect>
```

## Configuration

By default, the component will only be enabled in the development environment.

You can configure this behavior with the `disabled` prop:

```tsx
<Inspect
  disabled={
    process.env.NODE_ENV === 'staging' || 
    process.env.NODE_ENV === 'production'
  }
>
  <App />
</Inspect>
```

Optionally, you can leverage code splitting by wrapping the exported component and using your own instead.

> The library is lightweight enough for this to likely be a premature and insignificant optimization.

```tsx
import * as React from 'react';
import { InspectProps } from 'inspx';

const Inspect = React.lazy(() => import('inspx'));

export default function Loader(props: InspectProps) {
  if (process.env.NODE_ENV === 'development') {
    return children;
  }
  return (
    <React.Suspense fallback={null}>
      <Inspect {...props} />
    </React.Suspense>
  );
}
```

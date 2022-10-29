# useReach

Utility to use the [Reach](https://reach.sh) API inside React applications.

## Install

`npm install @collecteurs/use-reach --save` or `yarn add @collecteurs/use-reach`

### Peer dependencies

Don't forget to install the peer dependencies:

- `react` >= 17.0.0
- `@reach-sh/stdlib` >= 0.1.0

## Basic Usage

```jsx
import React from 'react'
import { ReachProvider } from '@collecteurs/use-reach'

const loadContract = async () => {
  return await import("../MyContract")
}

// Wrap your app with the ReachProvider
export const App = () => (
  return (
    <ReachProvider
      debug
      network="TESTNET"
      loadContract={loadContract}
      config={{ storage: { key: "my-reach-app" } }}>
      <MyComponent />
    </ReachProvider>
  )
)
```

```jsx
import React, { useState } from "react";
import { useReach } from "@collecteurs/use-reach";

// Use the useReach hook
export const MyComponent = () => {
  const { account, balance } = useReach();

  return (
    <div>
      <p>Network: {network}</p>
      <p>Currency: {account.currency}</p>
      <p>Provider: {account.provider}</p>
      <p>Account: {account.address}</p>
      <p>Balance: {balance}</p>
    </div>
  );
};
```

## API

### ReachProvider

The ReachProvider is a wrapper around the Reach API. It provides the context to the useReach hook.

#### Props

- `debug` (boolean): Enable debug mode. Default: `false`
- `network` (string): The network to use. Default: `TESTNET`
- `loadContract` (function): A function that returns the contract. Default: `() => {}`
- `config` (object): The Reach config. Default: `{}`
- `children` (node): The children to render.

#### Config

- `storage` (object): The storage config. Default: `{ key: "reach" }`
- `algo` (object): The Algorand config. Default: `{}`
- `logger` (string): The logger config. More info [here](https://github.com/doubco/logbook)

### useReach

The useReach hook provides the Reach API to the React application.

#### Returns

- `status` (string): The status of the Reach API. Can be `loading`, `ready`.
- `network` (string): The network name. Can be `TESTNET`, `MAINNET`.

- `lib` (object): The Reach.sh stdlib.
- `reach` (object): The Reach API.
- `contract` (object): The contract object you loaded.

- `getSigningLogs` (function): Get the signing logs.
- `connectWallet` (function): Connect the wallet.
- `disconnectWallet` (function): Disconnect the wallet.

- `account` (object): The account object.
- `balance` (number): The account balance.
- `getBalance` (function): Get any account address' balance.
- `fetching` (boolean): Is the balance fetching?

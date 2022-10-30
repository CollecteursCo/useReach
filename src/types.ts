import React from "react";
import { TLogBookConfig } from "@doubco/logbook";
import { Stdlib_User } from "@reach-sh/stdlib/dist/types/interfaces";
import { IAccount } from "@reach-sh/stdlib/dist/types/shared_impl";

export type ReachLib = Stdlib_User<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  IAccount<{ addr: string }, any, any, any, any>
>;

export type Connector = "ETH" | "ALGO" | "CFX";

export type ConnectorMode =
  | "ETH-devnet"
  | "ETH-live"
  | "ETH-browser"
  | "ALGO-devnet"
  | "ALGO-live"
  | "ALGO-browser"
  | "CFX-devnet"
  | "CFX-live"
  | "CFX-browser";

export type Lib = {
  loadStdlib: (
    connectorModeOrEnv?:
      | string
      | {
          [key: string]: string;
        },
  ) => ReachLib;
  getConnectorMode(): ConnectorMode;
  getConnector(connectorMode?: string): Connector;
  unsafeAllowMultipleStdlibs: () => void;
  Reach: (
    this: {},
    connectorModeOrEnv?:
      | string
      | {
          [key: string]: string;
        },
  ) => void;
  ALGO_MyAlgoConnect: any;
  ALGO_WalletConnect: any;
};

export type BlockchainNetwork = "MAINNET" | "TESTNET";

export type CryptoCurrency = "ETH" | "ALGO" | "CFX";

export type Wallet = "MYALGO" | "WALLETCONNECT";

export interface SimpleContract {
  address: string;
}

export type Account = {
  address: string;
  provider: Wallet;
  currency: CryptoCurrency;
  balance: number;
};

export type ReachProviderProps = {
  network?: BlockchainNetwork;
  debug?: boolean;
  onError?: (error: Error) => void;
  loadContract?: () => Promise<any>;
  config?: {
    storage?: {
      key: string;
    };
    logger?: TLogBookConfig;
    algo?: {
      token?: string;
      port?: string;
      server?: string;
      indexer?: { token?: string; port?: string; server?: string };
    };
  };
  children: React.ReactNode;
};

export type ReachContext = {
  network?: BlockchainNetwork;
  status: "loading" | "ready" | "error";
  fetching: boolean;
  lib: Lib | null;
  reach?: ReachLib | null;
  contract?: any;
  signingLogs?: any[];
  connectWallet: (currency: CryptoCurrency, provider: Wallet) => Promise<any>;
  disconnectWallet: (callback?: () => void) => void;
  getBalance: (addr: string) => Promise<number>;
  account: Account | undefined;
};

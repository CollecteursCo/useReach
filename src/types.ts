import React from "react";
import { TLogBookConfig } from "@doubco/logbook";
import { Stdlib_User } from "@reach-sh/stdlib/dist/types/interfaces";

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
  any
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

export enum BlockchainNetwork {
  MAINNET = "MAINNET",
  TESTNET = "TESTNET",
}

export enum CryptoCurrency {
  ALGO = "ALGO",
  ETH = "ETH",
}

export enum Wallet {
  MYALGO = "MYALGO",
  WALLETCONNECT = "WALLETCONNECT",
}

export type TReachProviderProps = {
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

export type TReachContext = {
  status: "loading" | "ready";
  network?: BlockchainNetwork;

  lib: Lib | null;
  reach: ReachLib | null;
  contract?: any;

  getSigningLogs: () => any[];

  connectWallet: (provider: Wallet) => Promise<any>;
  disconnectWallet: (callback?: () => void) => void;

  account: { address: string; provider: Wallet; currency: CryptoCurrency };

  fetching: boolean;

  balance: number;
  getBalance: (addr: string) => Promise<number>;
};

export type TBlockchainAccount = {
  address: string;
  provider: Wallet;
  currency: CryptoCurrency;
};

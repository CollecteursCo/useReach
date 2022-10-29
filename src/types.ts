import React from "react";
import { TLogBookConfig } from "@doubco/logbook";

export enum BlockchainNetwork {
  MAINNET = "MAINNET",
  TESTNET = "TESTNET",
}

export enum CryptoCurrency {
  ALGO = "ALGO",
  ETH = "ETH",
  SOL = "SOL",
}

export enum Wallet {
  MYALGO = "MYALGO",
  WALLETCONNECT = "WALLETCONNECT",
}

export type TReachProviderProps = {
  network?: BlockchainNetwork;
  debug?: boolean;
  onError?: (error: Error) => void;
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
  connectWallet: (provider: Wallet) => Promise<any>;
  disconnectWallet: (callback?: () => void) => void;
  getSigningLogs: () => any[];
  signingLogs: any[];
  account: { address: string; provider: Wallet; currency: CryptoCurrency };
  lib: any;
};

export type TBlockchainAccount = {
  address: string;
  provider: Wallet;
  currency: CryptoCurrency;
};

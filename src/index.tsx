import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import { LogBook } from "@doubco/logbook";

import {
  CryptoCurrency,
  TReachContext,
  TReachProviderProps,
  Wallet,
} from "./types";

import { Store } from "./utils/Store";

const Context = createContext<TReachContext>({} as any);

export const ReachProvider = (props: TReachProviderProps) => {
  const { network, config, debug, onError } = props;

  const ACCOUNT_STORAGE_KEY = config?.storage?.key
    ? config.storage.key
    : "reach";

  const reach = useRef<any>();
  const lib = useRef<any>();

  const logger = useCallback(() => {
    return new LogBook({
      ...(config?.logger || {}),
    });
  }, []);

  const [status, setStatus] = useState<TReachContext["status"]>("loading");
  const [signingLogs, setSigningLogs] = useState<any>([]);

  useEffect(() => {
    async function loadLibs() {
      import("@reach-sh/stdlib").then(async (x) => {
        lib.current = x.default;
        setStatus("ready");
      });
    }
    if (status === "loading") {
      if (!lib.current) {
        loadLibs();
      }
    } else if (status === "ready") {
      connectSavedWallet();
    }
  }, [status]);

  const loadMyAlgo = () => {
    const MyAlgoConnect = lib.current.ALGO_MyAlgoConnect;
    reach.current = lib.current.loadStdlib({
      REACH_CONNECTOR_MODE: "ALGO",
      REACH_DEBUG: debug ? "Y" : undefined,
    });
    reach.current.setWalletFallback(
      reach.current.walletFallback({
        providerEnv: {
          ALGO_TOKEN: config?.algo?.token || "",
          ALGO_PORT: config?.algo?.port || "",
          ALGO_SERVER: config?.algo?.server || "",
          ALGO_INDEXER_TOKEN: config?.algo?.indexer?.token || "",
          ALGO_INDEXER_PORT: config?.algo?.indexer?.port || "",
          ALGO_INDEXER_SERVER: config?.algo?.indexer?.server || "",
        },
        MyAlgoConnect,
      }),
    );
    reach.current.setSigningMonitor(async (evt: any, pre: any, post: any) => {
      const newArr = [evt, await pre, await post];
      setSigningLogs((prev: any) => {
        return [...prev, newArr];
      });
    });
  };

  const loadWalletConnect = () => {
    const WalletConnect = lib.current.ALGO_WalletConnect;
    reach.current = lib.current.loadStdlib({
      REACH_CONNECTOR_MODE: "ALGO",
      REACH_DEBUG: debug ? "Y" : undefined,
    });
    reach.current.setWalletFallback(
      reach.current.walletFallback({
        providerEnv: {
          ALGO_TOKEN: config?.algo?.token || "",
          ALGO_PORT: config?.algo?.port || "",
          ALGO_SERVER: config?.algo?.server || "",
          ALGO_INDEXER_TOKEN: config?.algo?.indexer?.token || "",
          ALGO_INDEXER_PORT: config?.algo?.indexer?.port || "",
          ALGO_INDEXER_SERVER: config?.algo?.indexer?.server || "",
        },
        WalletConnect,
      }),
    );

    reach.current.setSigningMonitor(async (evt: any, pre: any, post: any) => {
      const newArr = [evt, await pre, await post];
      setSigningLogs((prev: any) => {
        return [...prev, newArr];
      });
    });
  };

  const [account, setAccount] = useState<any>();

  async function connectSavedWallet() {
    let reachAccount;

    const account = Store.get("account", ACCOUNT_STORAGE_KEY);

    const { currency, address, provider } = account || {};

    if (currency === CryptoCurrency.ALGO) {
      try {
        if (address && provider !== undefined) {
          if (provider === Wallet.MYALGO) {
            loadMyAlgo();
          } else if (provider === Wallet.WALLETCONNECT) {
            loadWalletConnect();
          }
          reachAccount = await reach.current.connectAccount({ addr: address });

          setAccount({
            address: address,
            provider: provider,
            currency: currency,
          });
        }
      } catch (e) {
        console.error("Error when connecting to saved wallet", e);
      }
    }

    return reachAccount;
  }

  async function connectWallet(wallet: Wallet) {
    try {
      if (wallet === Wallet.MYALGO) {
        loadMyAlgo();
      } else if (wallet === Wallet.WALLETCONNECT) {
        loadWalletConnect();
      }
      const reachAccount = await reach.current.getDefaultAccount();
      const account = {
        address: reachAccount.networkAccount.addr,
        provider: wallet,
        currency: CryptoCurrency.ALGO,
      };

      Store.set({ account }, ACCOUNT_STORAGE_KEY);
      await new Promise((r) => setTimeout(r, 500));

      setAccount(account);

      return account;
    } catch (e) {
      logger.error("WALLET", "Error when connecting to wallet", e);
      onError && onError(e);
      return null;
    }
  }

  async function disconnectWallet() {
    try {
      setAccount(undefined);
      Store.clean(ACCOUNT_STORAGE_KEY);
    } catch (e) {
      logger.error("WALLET", "Error when disconnecting from wallet", e);
      onError && onError(e);
      return;
    }
  }

  return (
    <Context.Provider
      value={{
        status,
        network,
        lib: reach.current,
        connectWallet,
        disconnectWallet,
        account,
        signingLogs,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export const useReach = () => {
  const context = useContext(Context);
  return context;
};

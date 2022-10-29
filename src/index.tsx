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
  BlockchainNetwork,
  CryptoCurrency,
  TReachContext,
  TReachProviderProps,
  Wallet,
} from "./types";
import { Store } from "./utils/Store";

const Context = createContext<TReachContext>({} as any);

export const ReachProvider = (props: TReachProviderProps) => {
  const { loadContract, network, config, debug, onError } = props;

  const STORAGE_KEY = config?.storage?.key ? config.storage.key : "reach";

  const reach = useRef<TReachContext["reach"]>(null);
  const lib = useRef<TReachContext["lib"]>(null);
  const contract = useRef<any>(null);

  const logger = useCallback(() => {
    return new LogBook({
      ...(config?.logger || {}),
    });
  }, [])();

  const [status, setStatus] = useState<TReachContext["status"]>("loading");
  const [, setSigningLogs] = useState<any[]>([]);
  const [balance, setBalance] = useState<TReachContext["balance"]>(0);
  const [fetching, setFetching] = useState<boolean>(true);

  useEffect(() => {
    async function loadLibs() {
      import("@reach-sh/stdlib").then(async (x: any) => {
        lib.current = x.default;

        if (loadContract) {
          contract.current = await loadContract();
        }

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

  const getBalance = async (addr: string, decimals = 2) => {
    if (reach.current) {
      if (account?.currency === CryptoCurrency.ALGO) {
        const ra = await reach.current.connectAccount({ addr });
        const balance = await ra.balanceOf();

        return parseFloat(reach.current.formatCurrency(balance, decimals));
      }
    }

    return 0;
  };

  const setSigningMonitor = (reach: TReachContext["reach"]) => {
    if (reach) {
      reach.setSigningMonitor(async (evt: any, pre: any, post: any) => {
        const log = [evt, await pre, await post];
        setSigningLogs((prev: any) => {
          return [...prev, log];
        });
      });
    }
  };

  const loadAlgoWalletProvider = (WalletProvider: any) => {
    if (lib.current) {
      reach.current = lib.current.loadStdlib(
        debug
          ? {
              REACH_CONNECTOR_MODE: "ALGO",
            }
          : {
              REACH_CONNECTOR_MODE: "ALGO",
              REACH_DEBUG: "Y",
            },
      );

      if (reach.current) {
        reach.current.setWalletFallback(
          reach.current.walletFallback({
            providerEnv:
              network === BlockchainNetwork.TESTNET && !config?.algo
                ? "TestNet"
                : {
                    ALGO_TOKEN: config?.algo?.token || "",
                    ALGO_PORT: config?.algo?.port || "",
                    ALGO_SERVER: config?.algo?.server || "",
                    ALGO_INDEXER_TOKEN: config?.algo?.indexer?.token || "",
                    ALGO_INDEXER_PORT: config?.algo?.indexer?.port || "",
                    ALGO_INDEXER_SERVER: config?.algo?.indexer?.server || "",
                  },
            WalletProvider,
          }),
        );
        setSigningMonitor(reach.current);
      }
    }
  };

  const [account, setAccount] = useState<any>();

  async function connectSavedWallet() {
    if (!lib.current) return;
    if (!reach.current) return;

    let reachAccount;

    const account = Store.get("account", STORAGE_KEY);
    const { currency, address, provider } = account || {};

    if (currency === CryptoCurrency.ALGO) {
      try {
        if (address && provider !== undefined) {
          if (provider === Wallet.MYALGO) {
            loadAlgoWalletProvider(lib.current.ALGO_MyAlgoConnect);
          } else if (provider === Wallet.WALLETCONNECT) {
            loadAlgoWalletProvider(lib.current.ALGO_WalletConnect);
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

    setFetching(false);

    return reachAccount;
  }

  async function connectWallet(wallet: Wallet) {
    if (!lib.current) return;
    if (!reach.current) return;

    try {
      if (wallet === Wallet.MYALGO) {
        loadAlgoWalletProvider(lib.current.ALGO_MyAlgoConnect);
      } else if (wallet === Wallet.WALLETCONNECT) {
        loadAlgoWalletProvider(lib.current.ALGO_WalletConnect);
      }

      const reachAccount = await reach.current.getDefaultAccount();

      const account = {
        address: reachAccount.networkAccount.addr,
        provider: wallet,
        currency: CryptoCurrency.ALGO,
      };

      Store.set({ account }, STORAGE_KEY);
      await new Promise((r) => setTimeout(r, 500));
      setAccount(account);

      return account;
    } catch (e: any) {
      logger.error("WALLET", "Error when connecting to wallet", e);
      onError && onError(e);
      return null;
    }
  }

  async function disconnectWallet() {
    try {
      setAccount(undefined);
      Store.clean(STORAGE_KEY);
    } catch (e: any) {
      logger.error("WALLET", "Error when disconnecting from wallet", e);
      onError && onError(e);
      return;
    }
  }

  const getSigningLogs = () => {
    let items;
    setSigningLogs((prev: any) => {
      items = prev;
      return prev;
    });
    return items as unknown as any[];
  };

  return (
    <Context.Provider
      value={{
        status,
        network,

        lib: lib.current,
        reach: reach.current,
        contract: contract.current,

        getSigningLogs,

        connectWallet,
        disconnectWallet,
        account,

        balance,
        getBalance,

        fetching,
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

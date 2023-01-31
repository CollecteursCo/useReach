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
  SimpleContract,
  ReachContext,
  ReachProviderProps,
  Wallet,
} from "./types";
import { Store } from "./utils/Store";

const Context = createContext<ReachContext>({ signingLogs: [] } as any);

export function ReachProvider<Contract extends Partial<SimpleContract>>(
  props: ReachProviderProps,
) {
  const { loadContract, network, config, debug, onError } = props;
  const STORAGE_KEY = config?.storage?.key ? config.storage.key : "reach";

  const reach = useRef<ReachContext["reach"]>(null);
  const lib = useRef<ReachContext["lib"]>(null);
  const contract = useRef<Contract | null>(null);

  const logger = useCallback(() => {
    return new LogBook({
      ...(config?.logger || {}),
    });
  }, [])();

  const [status, setStatus] = useState<ReachContext["status"]>("loading");
  const [signingLogs, setSigningLogs] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<boolean>(true);
  const [account, setAccount] = useState<ReachContext["account"]>();

  useEffect(() => {
    async function loadLibs() {
      logger.info("USEREACH", "Loading stdlib.");
      import("@reach-sh/stdlib")
        .then(async (x: any) => {
          lib.current = x.default;
          logger.success("USEREACH", "stdlib loaded.");

          if (loadContract) {
            contract.current = await loadContract();
          }

          setStatus("ready");
        })
        .catch((e) => {
          logger.error("USEREACH", "loadLibs: stdlib not initialized.");
          onError && onError(new Error("stdlib not initialized."));
          setStatus("error");
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
    logger.info("USEREACH", "getBalance: Started.");
    if (reach.current) {
      if (account?.currency === "ALGO") {
        const ra = await reach.current.connectAccount({ addr });
        const balance = await ra.balanceOf();
        const formatted = parseFloat(
          reach.current.formatCurrency(balance, decimals),
        );

        logger.info("USEREACH", "getBalance: Ready.", balance, formatted);

        return formatted;
      }
    } else {
      onError && onError(new Error("Reach not initialized."));
      logger.error("USEREACH", "getBalance: Wallet not set.");
    }

    return 0;
  };

  const setSigningMonitor = (reach: ReachContext["reach"]) => {
    logger.info("USEREACH", "setSigningMonitor: Started.");
    if (reach) {
      reach.setSigningMonitor(async (evt: any, pre: any, post: any) => {
        const log = [evt, await pre, await post];
        logger.info("USEREACH", "setSigningMonitor: New signing log.", log);
        setSigningLogs((prev) => {
          return [...prev, log];
        });
      });
    } else {
      onError && onError(new Error("Reach not initialized."));
      logger.error("USEREACH", "setSigningMonitor: Wallet not set.");
    }
  };

  const loadAlgoWalletProvider = (WalletProviderOptions: any) => {
    logger.info(
      "USEREACH",
      "loadAlgoWalletProvider: Activating wallet.",
      WalletProviderOptions,
      network,
    );

    if (lib.current) {
      reach.current = lib.current.loadStdlib(
        debug
          ? {
              REACH_CONNECTOR_MODE: "ALGO",
              REACH_DEBUG: "Y",
            }
          : {
              REACH_CONNECTOR_MODE: "ALGO",
            },
      );

      if (reach.current) {
        reach.current.setWalletFallback(
          reach.current.walletFallback({
            providerEnv:
              network === "TESTNET" && !config?.algo
                ? "TestNet"
                : {
                    ALGO_TOKEN: config?.algo?.token || "",
                    ALGO_PORT: config?.algo?.port || "",
                    ALGO_SERVER: config?.algo?.server || "",
                    ALGO_INDEXER_TOKEN: config?.algo?.indexer?.token || "",
                    ALGO_INDEXER_PORT: config?.algo?.indexer?.port || "",
                    ALGO_INDEXER_SERVER: config?.algo?.indexer?.server || "",
                  },
            ...WalletProviderOptions,
          }),
        );

        logger.success(
          "USEREACH",
          "loadAlgoWalletProvider: Wallet ready.",
          WalletProviderOptions,
          network,
        );

        setSigningMonitor(reach.current);
      }
    } else {
      logger.error(
        "USEREACH",
        "loadAlgoWalletProvider: stdlib not initialized.",
      );
      onError && onError(new Error("Stdlib not initialized."));
    }
  };

  async function connectSavedWallet() {
    logger.info("USEREACH", "connectSavedWallet: Activating saved wallet.");

    if (!lib.current) {
      onError && onError(new Error("Stdlib not initialized."));
      logger.error("USEREACH", "connectSavedWallet: stdlib not initialized.");
      return;
    }

    let ra: Awaited<ReturnType<ReachContext["reach"]["connectAccount"]>>;

    const account = Store.get("account", STORAGE_KEY);
    const { currency, address, provider } = account || {};

    if (currency === "ALGO") {
      try {
        if (address && provider !== undefined) {
          if (provider === "MYALGO") {
            loadAlgoWalletProvider({
              MyAlgoConnect: lib.current.ALGO_MyAlgoConnect,
            });
          } else if (provider === "WALLETCONNECT") {
            loadAlgoWalletProvider({
              WalletConnect: lib.current.ALGO_WalletConnect,
            });
          }

          logger.success("USEREACH", "connectSavedWallet: Wallet ready.");

          ra = await reach.current.connectAccount({ addr: address });

          setAccount({
            address: address,
            provider: provider,
            currency: currency,
            balance: await getBalance(address),
          });

          logger.success("USEREACH", "connectSavedWallet: Wallet connected.");
        }
      } catch (e) {
        logger.error("USEREACH", "connectSavedWallet: Error", e);
        onError && onError(e);
        return null;
      }
    }

    setConnecting(false);

    return ra;
  }

  async function connectWallet(currency: CryptoCurrency, wallet: Wallet) {
    setConnecting(true);

    logger.info("USEREACH", "connectWallet: Activating wallet.", wallet);

    if (!lib.current) {
      onError && onError(new Error("Stdlib not initialized."));
      logger.error("USEREACH", "connectWallet: stdlib not initialized.");
      return;
    }

    try {
      if (currency === "ALGO") {
        if (wallet === "MYALGO") {
          loadAlgoWalletProvider({
            MyAlgoConnect: lib.current.ALGO_MyAlgoConnect,
          });
        } else if (wallet === "WALLETCONNECT") {
          loadAlgoWalletProvider({
            WalletConnect: lib.current.ALGO_WalletConnect,
          });
        }
      }

      logger.success("USEREACH", "connectWallet: Wallet ready.");

      if (!reach.current) {
        setConnecting(false);
        return;
      }

      const reachAccount = await reach.current.getDefaultAccount();

      const account: ReachContext["account"] = {
        address: reachAccount.networkAccount.addr,
        provider: wallet,
        currency: "ALGO",
        balance: 0,
      };

      Store.set({ account }, STORAGE_KEY);

      // cheap hack for render cycle, will fix later
      await new Promise((r) => setTimeout(r, 500));

      setAccount({
        ...account,
        balance: await getBalance(account.address),
      });

      logger.success("USEREACH", "connectWallet: Wallet connected.");

      setConnecting(false);
      return account;
    } catch (e: any) {
      logger.error("USEREACH", "connectWallet: Error", e);
      onError && onError(e);
      setConnecting(false);
      return null;
    }
  }

  async function connectToKnownWallet({
    currency,
    address,
    provider,
  }: {
    address: string;
    provider: Wallet;
    currency: CryptoCurrency;
  }) {
    logger.info("USEREACH", "connectToKnownWallet: Activating wallet.");

    if (!lib.current) {
      onError && onError(new Error("Stdlib not initialized."));
      logger.error("USEREACH", "connectToKnownWallet: stdlib not initialized.");
      return;
    }

    let ra: Awaited<ReturnType<ReachContext["reach"]["connectAccount"]>>;

    if (currency === "ALGO") {
      try {
        if (address && provider !== undefined) {
          if (provider === "MYALGO") {
            loadAlgoWalletProvider({
              MyAlgoConnect: lib.current.ALGO_MyAlgoConnect,
            });
          } else if (provider === "WALLETCONNECT") {
            loadAlgoWalletProvider({
              WalletConnect: lib.current.ALGO_WalletConnect,
            });
          }

          logger.success("USEREACH", "connectToKnownWallet: Wallet ready.");

          ra = await reach.current.connectAccount({ addr: address });

          setAccount({
            address: address,
            provider: provider,
            currency: currency,
            balance: await getBalance(address),
          });

          logger.success("USEREACH", "connectToKnownWallet: Wallet connected.");
        }
      } catch (e) {
        logger.error("USEREACH", "connectToKnownWallet: Error", e);
        onError && onError(e);
        return null;
      }
    }

    setConnecting(false);

    return ra;
  }

  async function disconnectWallet() {
    try {
      setAccount(undefined);
      Store.clean(STORAGE_KEY);
      logger.success("USEREACH", "disconnectWallet: Wallet disconnected.");
    } catch (e: any) {
      logger.error("USEREACH", "disconnectWallet: Error", e);
      onError && onError(e);
      return;
    }
  }

  return (
    <Context.Provider
      value={{
        status,
        connecting,
        network,
        lib: lib.current,
        reach: reach.current,
        contract: contract.current,
        signingLogs,
        connectWallet,
        connectToKnownWallet,
        disconnectWallet,
        getBalance,
        account,
      }}
    >
      {props.children}
    </Context.Provider>
  );
}

export const useReach = () => {
  const context = useContext(Context);
  return context;
};

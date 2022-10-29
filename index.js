'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var logbook = require('@doubco/logbook');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

var BlockchainNetwork;
(function (BlockchainNetwork) {
    BlockchainNetwork["MAINNET"] = "MAINNET";
    BlockchainNetwork["TESTNET"] = "TESTNET";
})(BlockchainNetwork || (BlockchainNetwork = {}));
var CryptoCurrency;
(function (CryptoCurrency) {
    CryptoCurrency["ALGO"] = "ALGO";
    CryptoCurrency["ETH"] = "ETH";
    CryptoCurrency["SOL"] = "SOL";
})(CryptoCurrency || (CryptoCurrency = {}));
var Wallet;
(function (Wallet) {
    Wallet["MYALGO"] = "MYALGO";
    Wallet["WALLETCONNECT"] = "WALLETCONNECT";
})(Wallet || (Wallet = {}));

const LocalStorage = {
    set: function (key, value) {
        try {
            localStorage.setItem(key, value);
        }
        catch (e) { }
    },
    get: function (key) {
        try {
            return localStorage.getItem(key);
        }
        catch (e) { }
        return null;
    },
    remove: function (key) {
        try {
            localStorage.removeItem(key);
        }
        catch (e) { }
        return null;
    },
};
const defaultStore = "__store";
const Store = {
    get: (key, store) => {
        const ls = LocalStorage.get(store || defaultStore);
        if (ls)
            return JSON.parse(ls)[key];
        return null;
    },
    set: (data, store) => {
        let ls = LocalStorage.get(store || defaultStore);
        if (!ls)
            ls = "{}";
        const parsed = JSON.parse(ls);
        Object.keys(data).forEach((key) => {
            const value = data[key];
            parsed[key] = value;
        });
        LocalStorage.set(store || defaultStore, JSON.stringify(parsed));
    },
    remove: (key, store) => {
        let ls = LocalStorage.get(store || defaultStore);
        if (!ls)
            ls = "{}";
        const parsed = JSON.parse(ls);
        delete parsed[key];
        LocalStorage.set(store || defaultStore, JSON.stringify(parsed));
    },
    clean: (store) => {
        LocalStorage.remove(store || defaultStore);
    },
};

const Context = React.createContext({});
const ReachProvider = (props) => {
    var _a;
    const { loadContract, network, config, debug, onError } = props;
    const STORAGE_KEY = ((_a = config === null || config === void 0 ? void 0 : config.storage) === null || _a === void 0 ? void 0 : _a.key) ? config.storage.key : "reach";
    const reach = React.useRef(null);
    const lib = React.useRef(null);
    const contract = React.useRef(null);
    const logger = React.useCallback(() => {
        return new logbook.LogBook(Object.assign({}, ((config === null || config === void 0 ? void 0 : config.logger) || {})));
    }, [])();
    const [status, setStatus] = React.useState("loading");
    const [, setSigningLogs] = React.useState([]);
    React.useEffect(() => {
        function loadLibs() {
            return __awaiter(this, void 0, void 0, function* () {
                Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('@reach-sh/stdlib')); }).then((x) => __awaiter(this, void 0, void 0, function* () {
                    lib.current = x.default;
                    if (loadContract) {
                        contract.current = yield loadContract();
                    }
                    setStatus("ready");
                }));
            });
        }
        if (status === "loading") {
            if (!lib.current) {
                loadLibs();
            }
        }
        else if (status === "ready") {
            connectSavedWallet();
        }
    }, [status]);
    const setSigningMonitor = (reach) => {
        if (reach) {
            reach.setSigningMonitor((evt, pre, post) => __awaiter(void 0, void 0, void 0, function* () {
                const log = [evt, yield pre, yield post];
                setSigningLogs((prev) => {
                    return [...prev, log];
                });
            }));
        }
    };
    const loadAlgoWalletProvider = (WalletProvider) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (lib.current) {
            reach.current = lib.current.loadStdlib(debug
                ? {
                    REACH_CONNECTOR_MODE: "ALGO",
                }
                : {
                    REACH_CONNECTOR_MODE: "ALGO",
                    REACH_DEBUG: "Y",
                });
            if (reach.current) {
                reach.current.setWalletFallback(reach.current.walletFallback({
                    providerEnv: network === BlockchainNetwork.TESTNET && !(config === null || config === void 0 ? void 0 : config.algo)
                        ? "TestNet"
                        : {
                            ALGO_TOKEN: ((_a = config === null || config === void 0 ? void 0 : config.algo) === null || _a === void 0 ? void 0 : _a.token) || "",
                            ALGO_PORT: ((_b = config === null || config === void 0 ? void 0 : config.algo) === null || _b === void 0 ? void 0 : _b.port) || "",
                            ALGO_SERVER: ((_c = config === null || config === void 0 ? void 0 : config.algo) === null || _c === void 0 ? void 0 : _c.server) || "",
                            ALGO_INDEXER_TOKEN: ((_e = (_d = config === null || config === void 0 ? void 0 : config.algo) === null || _d === void 0 ? void 0 : _d.indexer) === null || _e === void 0 ? void 0 : _e.token) || "",
                            ALGO_INDEXER_PORT: ((_g = (_f = config === null || config === void 0 ? void 0 : config.algo) === null || _f === void 0 ? void 0 : _f.indexer) === null || _g === void 0 ? void 0 : _g.port) || "",
                            ALGO_INDEXER_SERVER: ((_j = (_h = config === null || config === void 0 ? void 0 : config.algo) === null || _h === void 0 ? void 0 : _h.indexer) === null || _j === void 0 ? void 0 : _j.server) || "",
                        },
                    WalletProvider,
                }));
                setSigningMonitor(reach.current);
            }
        }
    };
    const [account, setAccount] = React.useState();
    function connectSavedWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!lib.current)
                return;
            if (!reach.current)
                return;
            let reachAccount;
            const account = Store.get("account", STORAGE_KEY);
            const { currency, address, provider } = account || {};
            if (currency === CryptoCurrency.ALGO) {
                try {
                    if (address && provider !== undefined) {
                        if (provider === Wallet.MYALGO) {
                            loadAlgoWalletProvider(lib.current.ALGO_MyAlgoConnect);
                        }
                        else if (provider === Wallet.WALLETCONNECT) {
                            loadAlgoWalletProvider(lib.current.ALGO_WalletConnect);
                        }
                        reachAccount = yield reach.current.connectAccount({ addr: address });
                        setAccount({
                            address: address,
                            provider: provider,
                            currency: currency,
                        });
                    }
                }
                catch (e) {
                    console.error("Error when connecting to saved wallet", e);
                }
            }
            return reachAccount;
        });
    }
    function connectWallet(wallet) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!lib.current)
                return;
            if (!reach.current)
                return;
            try {
                if (wallet === Wallet.MYALGO) {
                    loadAlgoWalletProvider(lib.current.ALGO_MyAlgoConnect);
                }
                else if (wallet === Wallet.WALLETCONNECT) {
                    loadAlgoWalletProvider(lib.current.ALGO_WalletConnect);
                }
                const reachAccount = yield reach.current.getDefaultAccount();
                const account = {
                    address: reachAccount.networkAccount.addr,
                    provider: wallet,
                    currency: CryptoCurrency.ALGO,
                };
                Store.set({ account }, STORAGE_KEY);
                yield new Promise((r) => setTimeout(r, 500));
                setAccount(account);
                return account;
            }
            catch (e) {
                logger.error("WALLET", "Error when connecting to wallet", e);
                onError && onError(e);
                return null;
            }
        });
    }
    function disconnectWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                setAccount(undefined);
                Store.clean(STORAGE_KEY);
            }
            catch (e) {
                logger.error("WALLET", "Error when disconnecting from wallet", e);
                onError && onError(e);
                return;
            }
        });
    }
    const getSigningLogs = () => {
        let items;
        setSigningLogs((prev) => {
            items = prev;
            return prev;
        });
        return items;
    };
    return (React__default["default"].createElement(Context.Provider, { value: {
            status,
            network,
            lib: lib.current,
            reach: reach.current,
            contract: contract.current,
            connectWallet,
            disconnectWallet,
            account,
            getSigningLogs,
        } }, props.children));
};
const useReach = () => {
    const context = React.useContext(Context);
    return context;
};

exports.ReachProvider = ReachProvider;
exports.useReach = useReach;
//# sourceMappingURL=index.js.map

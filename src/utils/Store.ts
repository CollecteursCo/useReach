export const LocalStorage = {
  set: function (key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  },
  get: function (key: string) {
    try {
      return localStorage.getItem(key);
    } catch (e) {}

    return null;
  },
  remove: function (key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {}

    return null;
  },
};

const defaultStore = "__store";

export const Store = {
  get: (key: string, store: string) => {
    const ls = LocalStorage.get(store || defaultStore);
    if (ls) return JSON.parse(ls)[key];
    return null;
  },
  set: (data: any, store: string) => {
    let ls = LocalStorage.get(store || defaultStore);
    if (!ls) ls = "{}";

    const parsed = JSON.parse(ls);
    Object.keys(data).forEach((key: string) => {
      const value = data[key];
      parsed[key] = value;
    });
    LocalStorage.set(store || defaultStore, JSON.stringify(parsed));
  },
  remove: (key: string, store: string) => {
    let ls = LocalStorage.get(store || defaultStore);
    if (!ls) ls = "{}";

    const parsed = JSON.parse(ls);

    delete parsed[key];

    LocalStorage.set(store || defaultStore, JSON.stringify(parsed));
  },
  clean: (store: string) => {
    LocalStorage.remove(store || defaultStore);
  },
};

export default { Store, LocalStorage };

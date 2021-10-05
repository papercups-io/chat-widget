// TODO: do something different for dev vs prod
const PREFIX = '__PAPERCUPS__';

type StorageType = 'local' | 'session' | 'cookie' | 'memory' | 'none' | null;

interface Storage {
  get: (key: string) => any;
  set: (key: string, value: any) => void;
  remove: (key: string) => any;
}

type FallbackStorage = Storage & {
  _db: Record<string, any>;
  getItem: (key: string) => any;
  setItem: (key: string, value: any) => void;
  removeItem: (key: string) => any;
};

const useFallbackStorage = (): FallbackStorage => {
  return {
    _db: {},
    getItem(key: string) {
      return this._db[key] || null;
    },
    setItem(key: string, value: any) {
      this._db[key] = value;
    },
    removeItem(key: string) {
      delete this._db[key];
    },
    // Aliases
    get(key: string) {
      return this._db[key] || null;
    },
    set(key: string, value: any) {
      this._db[key] = value;
    },
    remove(key: string) {
      delete this._db[key];
    },
  };
};

const useLocalStorage = (w: any): Storage => {
  try {
    const storage = w && w.localStorage;

    return {
      ...storage,
      get: (key: string) => {
        const result = storage.getItem(`${PREFIX}${key}`);

        if (!result) {
          return null;
        }

        try {
          return JSON.parse(result);
        } catch (e) {
          return result;
        }
      },
      set: (key: string, value: any) => {
        storage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
      },
      remove: (key: string) => {
        storage.removeItem(key);
      },
    };
  } catch (e) {
    return useFallbackStorage();
  }
};

const useSessionStorage = (w: any): Storage => {
  try {
    const storage = w && w.sessionStorage;

    // NB: this is the same as `localStorage` above
    return {
      ...storage,
      get: (key: string) => {
        const result = storage.getItem(`${PREFIX}${key}`);

        if (!result) {
          return null;
        }

        try {
          return JSON.parse(result);
        } catch (e) {
          return result;
        }
      },
      set: (key: string, value: any) => {
        storage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
      },
      remove: (key: string) => {
        storage.removeItem(key);
      },
    };
  } catch (e) {
    return useFallbackStorage();
  }
};

const useCookieStorage = (): Storage => {
  try {
    throw new Error('Cookie storage has not been implemented!');
  } catch (e) {
    return useFallbackStorage();
  }
};

// FIXME: this is just a workaround until we can stop
// relying on localStorage in our chat iframe
const getPreferredStorage = (w: any, type: StorageType = 'local'): Storage => {
  try {
    switch (type) {
      case 'local':
        return useLocalStorage(w);
      case 'session':
        return useSessionStorage(w);
      case 'cookie':
        return useCookieStorage();
      case 'memory':
      default:
        return useFallbackStorage();
    }
  } catch (e) {
    return useFallbackStorage();
  }
};

export default function store(
  w: any,
  options: {defaultType?: StorageType; openStateType?: StorageType} = {}
) {
  const {defaultType = 'local', openStateType = 'session'} = options;
  // TODO: add support for using cookies as well
  const defaultStorage = getPreferredStorage(w, defaultType);
  const openStateStorage = getPreferredStorage(w, openStateType);

  // TODO: improve these names
  return {
    getCustomerId: () => defaultStorage.get('__CUSTOMER_ID__'),
    setCustomerId: (id: string) => defaultStorage.set('__CUSTOMER_ID__', id),
    removeCustomerId: () => defaultStorage.remove('__CUSTOMER_ID__'),
    // Open state
    getOpenState: () => openStateStorage.get(':open'),
    setOpenState: (state: string | boolean) =>
      openStateStorage.set(':open', state),
    clearOpenState: () => openStateStorage.remove(':open'),
    // Popup seen state
    getPopupSeen: () => openStateStorage.get(':pop_up_seen'),
    setPopupSeen: (state: string | boolean) =>
      openStateStorage.set(':pop_up_seen', state),
    clearPopupSeen: () => openStateStorage.remove(':pop_up_seen'),
  };
}

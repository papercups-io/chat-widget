// TODO: do something different for dev vs prod
// TODO: do something different for dev vs prod
const PREFIX = '__PAPERCUPS__';

// FIXME: this is just a workaround until we can stop
// relying on localStorage in our chat iframe
const getStorage = (w: any) => {
  try {
    const storage = w && (w.localStorage || w.sessionStorage);

    return storage;
  } catch (e) {
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
    };
  }
};

export default function store(w: any) {
  const storage = getStorage(w);

  const get = (key: string) => {
    const result = storage.getItem(`${PREFIX}${key}`);

    if (!result) {
      return null;
    }

    try {
      return JSON.parse(result);
    } catch (e) {
      return result;
    }
  };

  const set = (key: string, value: any) => {
    storage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  };

  const remove = (key: string) => {
    storage.removeItem(key);
  };

  // TODO: improve these names

  return {
    getCustomerId: () => get('__CUSTOMER_ID__'),
    setCustomerId: (id: string) => set('__CUSTOMER_ID__', id),
    removeCustomerId: () => remove('__CUSTOMER_ID__'),
  };
}

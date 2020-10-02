export const helpers = (win: any) => {
  const ArrayProto = Array.prototype;
  const FuncProto = Function.prototype;
  const ObjProto = Object.prototype;
  const toString = ObjProto.toString;
  const hasOwnProperty = ObjProto.hasOwnProperty;
  const windowConsole = win.console;
  const navigator = win.navigator;
  const document = win.document;
  const windowOpera = (win as any).opera;
  const screen = win.screen;
  const userAgent = navigator.userAgent;
  const intl = win.Intl;

  const nativeBind = FuncProto.bind;
  const nativeForEach = ArrayProto.forEach;
  const nativeIndexOf = ArrayProto.indexOf;
  const nativeIsArray = Array.isArray;
  const slice = ArrayProto.slice;
  const breaker = {};

  const __NOOP = function () {};
  const __NOOPTIONS = {};

  const isArray =
    nativeIsArray ||
    function (obj: any) {
      return toString.call(obj) === '[object Array]';
    };

  function isObject(obj: any) {
    return obj === Object(obj) && !isArray(obj);
  }

  function isFunction(f: any) {
    try {
      return /^\s*\bfunction\b/.test(f);
    } catch (x) {
      return false;
    }
  }

  function isString(obj: any) {
    return toString.call(obj) == '[object String]';
  }

  function includes(str: any, needle: any) {
    return str.indexOf(needle) !== -1;
  }

  function isUndefined(obj: any) {
    return obj === void 0;
  }

  function timestamp() {
    Date.now =
      Date.now ||
      function () {
        return +new Date();
      };

    return Date.now();
  }

  function each(obj: any, iterator: any, context?: any) {
    if (obj === null || obj === undefined) {
      return;
    }
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
          return;
        }
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) {
            return;
          }
        }
      }
    }
  }

  function trim(str: string) {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Polyfill
    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  }

  function extend(obj: any, ...args: Array<any>) {
    each(args, function (source: any) {
      for (let prop in source) {
        if (source[prop] !== void 0) {
          obj[prop] = source[prop];
        }
      }
    });

    return obj;
  }

  function bind(func: any, context: any) {
    let args: any;
    let bound: any;

    if (nativeBind && func.bind === nativeBind) {
      return nativeBind.apply(func, slice.call(arguments, 1));
    }
    if (!isFunction(func)) {
      throw new TypeError();
    }
    args = slice.call(arguments, 2);
    bound = function () {
      if (!(this instanceof bound)) {
        return func.apply(context, args.concat(slice.call(arguments)));
      }
      let ctor: any = {};
      ctor.prototype = func.prototype;
      let self = new ctor();
      ctor.prototype = null;
      let result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) {
        return result;
      }
      return self;
    };
    return bound;
  }

  function truncate(obj: any, length: number) {
    let ret: any;

    if (typeof obj === 'string') {
      ret = obj.slice(0, length);
    } else if (isArray(obj)) {
      ret = [];
      each(obj, function (val: any) {
        ret.push(truncate(val, length));
      });
    } else if (isObject(obj)) {
      ret = {};
      each(obj, function (val: any, key: string) {
        ret[key] = truncate(val, length);
      });
    } else {
      ret = obj;
    }

    return ret;
  }

  function stripEmptyProperties(obj: any) {
    let ret: any = {};

    each(obj, function (v: any, k: string) {
      if (isString(v) && v.length > 0) {
        ret[k] = v;
      }
    });

    return ret;
  }

  function HTTPBuildQuery(formdata: any, arg_separator?: any) {
    let use_val;
    let use_key;
    let arr: Array<any> = [];

    if (isUndefined(arg_separator)) {
      arg_separator = '&';
    }

    each(formdata, function (val: any, key: string) {
      use_val = encodeURIComponent(val.toString());
      use_key = encodeURIComponent(key);
      arr[arr.length] = use_key + '=' + use_val;
    });

    return arr.join(arg_separator);
  }

  const JSONEncode = (function () {
    return function (mixed_val: any) {
      var value = mixed_val;
      var quote = function (string: string) {
        var escapable = /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g; // eslint-disable-line no-control-regex
        var meta: any = {
          // table of character substitutions
          '\b': '\\b',
          '\t': '\\t',
          '\n': '\\n',
          '\f': '\\f',
          '\r': '\\r',
          '"': '\\"',
          '\\': '\\\\',
        };

        escapable.lastIndex = 0;
        return escapable.test(string)
          ? '"' +
              string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string'
                  ? c
                  : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
              }) +
              '"'
          : '"' + string + '"';
      };

      var str = function (key: any, holder: any) {
        let gap = '';
        let indent = '    ';
        let i = 0; // The loop counter.
        let k = ''; // The member key.
        let v: any = ''; // The member value.
        let length = 0;
        let mind = gap;
        let partial = [];
        let value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.
        if (
          value &&
          typeof value === 'object' &&
          typeof value.toJSON === 'function'
        ) {
          value = value.toJSON(key);
        }

        // What happens next depends on the value's type.
        switch (typeof value) {
          case 'string':
            return quote(value);

          case 'number':
            // JSON numbers must be finite. Encode non-finite numbers as null.
            return isFinite(value) ? String(value) : 'null';
          case 'boolean':
          case 'undefined':
            // case 'null':
            // If the value is a boolean or null, convert it to a string. Note:
            // typeof null does not produce 'null'. The case is included here in
            // the remote chance that this gets fixed someday.

            return String(value);
          case 'object':
            // If the type is 'object', we might be dealing with an object or an array or
            // null.
            // Due to a specification blunder in ECMAScript, typeof null is 'object',
            // so watch out for that case.
            if (!value) {
              return 'null';
            }

            // Make an array to hold the partial results of stringifying this object value.
            gap += indent;
            partial = [];

            // Is the value an array?
            if (toString.apply(value) === '[object Array]') {
              // The value is an array. Stringify every element. Use null as a placeholder
              // for non-JSON values.

              length = value.length;
              for (i = 0; i < length; i += 1) {
                partial[i] = str(i, value) || 'null';
              }

              // Join all of the elements together, separated with commas, and wrap them in
              // brackets.
              v =
                partial.length === 0
                  ? '[]'
                  : gap
                  ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                  : '[' + partial.join(',') + ']';
              gap = mind;
              return v;
            }

            // Iterate through all of the keys in the object.
            for (k in value) {
              if (hasOwnProperty.call(value, k)) {
                v = str(k, value);
                if (v) {
                  partial.push(quote(k) + (gap ? ': ' : ':') + v);
                }
              }
            }

            // Join all of the member texts together, separated with commas,
            // and wrap them in braces.
            v =
              partial.length === 0
                ? '{}'
                : gap
                ? '{' + partial.join(',') + '' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
      };

      // Make a fake root object containing our value under the key of ''.
      // Return the result of stringifying the value.
      return str('', {
        '': value,
      });
    };
  })();

  const JSONDecode = (function () {
    let at: any; // The index of the current character
    let ch: any; // The current character
    let escapee: any = {
      '"': '"',
      '\\': '\\',
      '/': '/',
      b: '\b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t',
    };
    let text: string;
    let error = function (m: string) {
      var e: any = new SyntaxError(m);
      e.at = at;
      e.text = text;
      throw e;
    };
    let next = function (c?: any) {
      // If a c parameter is provided, verify that it matches the current character.
      if (c && c !== ch) {
        error("Expected '" + c + "' instead of '" + ch + "'");
      }
      // Get the next character. When there are no more characters,
      // return the empty string.
      ch = text.charAt(at);
      at += 1;
      return ch;
    };
    let number = function () {
      // Parse a number value.
      var number,
        string = '';

      if (ch === '-') {
        string = '-';
        next('-');
      }
      while (ch >= '0' && ch <= '9') {
        string += ch;
        next();
      }
      if (ch === '.') {
        string += '.';
        while (next() && ch >= '0' && ch <= '9') {
          string += ch;
        }
      }
      if (ch === 'e' || ch === 'E') {
        string += ch;
        next();
        if (ch === '-' || ch === '+') {
          string += ch;
          next();
        }
        while (ch >= '0' && ch <= '9') {
          string += ch;
          next();
        }
      }
      number = +string;
      if (!isFinite(number)) {
        error('Bad number');
      } else {
        return number;
      }
    };
    let string = function () {
      // Parse a string value.
      let hex;
      let i;
      let string = '';
      let uffff;

      // When parsing for string values, we must look for " and \ characters.
      if (ch === '"') {
        while (next()) {
          if (ch === '"') {
            next();
            return string;
          }
          if (ch === '\\') {
            next();
            if (ch === 'u') {
              uffff = 0;
              for (i = 0; i < 4; i += 1) {
                hex = parseInt(next(), 16);
                if (!isFinite(hex)) {
                  break;
                }
                uffff = uffff * 16 + hex;
              }
              string += String.fromCharCode(uffff);
            } else if (typeof escapee[ch] === 'string') {
              string += escapee[ch];
            } else {
              break;
            }
          } else {
            string += ch;
          }
        }
      }
      error('Bad string');
    };
    let white = function () {
      // Skip whitespace.
      while (ch && ch <= ' ') {
        next();
      }
    };
    let word = function () {
      // true, false, or null.
      switch (ch) {
        case 't':
          next('t');
          next('r');
          next('u');
          next('e');
          return true;
        case 'f':
          next('f');
          next('a');
          next('l');
          next('s');
          next('e');
          return false;
        case 'n':
          next('n');
          next('u');
          next('l');
          next('l');
          return null;
      }
      error('Unexpected "' + ch + '"');
    };
    let value: any; // Placeholder for the value function.
    let array = function () {
      // Parse an array value.
      var array: Array<any> = [];

      if (ch === '[') {
        next('[');
        white();
        if (ch === ']') {
          next(']');
          return array; // empty array
        }
        while (ch) {
          array.push(value());
          white();
          if (ch === ']') {
            next(']');
            return array;
          }
          next(',');
          white();
        }
      }
      error('Bad array');
    };
    let object = function () {
      // Parse an object value.
      let key: any;
      let object: any = {};

      if (ch === '{') {
        next('{');
        white();
        if (ch === '}') {
          next('}');
          return object; // empty object
        }
        while (ch) {
          key = string();
          white();
          next(':');
          if (Object.hasOwnProperty.call(object, key)) {
            error('Duplicate key "' + key + '"');
          }
          object[key] = value();
          white();
          if (ch === '}') {
            next('}');
            return object;
          }
          next(',');
          white();
        }
      }
      error('Bad object');
    };

    value = function () {
      // Parse a JSON value. It could be an object, an array, a string,
      // a number, or a word.
      white();
      switch (ch) {
        case '{':
          return object();
        case '[':
          return array();
        case '"':
          return string();
        case '-':
          return number();
        default:
          return ch >= '0' && ch <= '9' ? number() : word();
      }
    };

    // Return the json_parse function. It will have access to all of the
    // above functions and variables.
    return function (source: any) {
      var result;

      text = source;
      at = 0;
      ch = ' ';
      result = value();
      white();
      if (ch) {
        error('Syntax error');
      }

      return result;
    };
  })();

  function utf8Encode(string: string) {
    string = (string + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    var utftext = '',
      start,
      end;
    var stringl = 0,
      n;

    start = end = 0;
    stringl = string.length;

    for (n = 0; n < stringl; n++) {
      var c1 = string.charCodeAt(n);
      var enc = null;

      if (c1 < 128) {
        end++;
      } else if (c1 > 127 && c1 < 2048) {
        enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
      } else {
        enc = String.fromCharCode(
          (c1 >> 12) | 224,
          ((c1 >> 6) & 63) | 128,
          (c1 & 63) | 128
        );
      }
      if (enc !== null) {
        if (end > start) {
          utftext += string.substring(start, end);
        }
        utftext += enc;
        start = end = n + 1;
      }
    }

    if (end > start) {
      utftext += string.substring(start, string.length);
    }

    return utftext;
  }

  function base64Encode(data: any) {
    var b64 =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1,
      o2,
      o3,
      h1,
      h2,
      h3,
      h4,
      bits,
      i = 0,
      ac = 0,
      enc = '',
      tmp_arr = [];

    if (!data) {
      return data;
    }

    data = utf8Encode(data);

    do {
      // pack three octets into four hexets
      o1 = data.charCodeAt(i++);
      o2 = data.charCodeAt(i++);
      o3 = data.charCodeAt(i++);

      bits = (o1 << 16) | (o2 << 8) | o3;

      h1 = (bits >> 18) & 0x3f;
      h2 = (bits >> 12) & 0x3f;
      h3 = (bits >> 6) & 0x3f;
      h4 = bits & 0x3f;

      // use hexets to index into b64, and append result to encoded string
      tmp_arr[ac++] =
        b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
      case 1:
        enc = enc.slice(0, -2) + '==';
        break;
      case 2:
        enc = enc.slice(0, -1) + '=';
        break;
    }

    return enc;
  }

  function getQueryParam(url: string, param: string) {
    // Expects a raw URL
    param = param.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');

    const regexS = '[\\?&]' + param + '=([^&#]*)';
    const regex = new RegExp(regexS);
    const results = regex.exec(url);

    if (
      results === null ||
      (results && typeof results[1] !== 'string' && (results[1] as any).length)
    ) {
      return '';
    } else {
      var result = results[1];
      try {
        result = decodeURIComponent(result);
      } catch (err) {
        console.error('Skipping decoding for malformed query param: ' + result);
      }
      return result.replace(/\+/g, ' ');
    }
  }

  return {
    ArrayProto,
    FuncProto,
    ObjProto,
    toString,
    hasOwnProperty,
    win,
    windowConsole,
    navigator,
    document,
    windowOpera,
    screen,
    userAgent,
    intl,
    nativeBind,
    nativeForEach,
    nativeIndexOf,
    nativeIsArray,
    slice,
    breaker,
    __NOOP,
    __NOOPTIONS,
    isFunction,
    isString,
    includes,
    isUndefined,
    timestamp,
    each,
    trim,
    extend,
    bind,
    truncate,
    stripEmptyProperties,
    HTTPBuildQuery,
    JSONEncode,
    JSONDecode,
    utf8Encode,
    base64Encode,
    getQueryParam,
  };
};

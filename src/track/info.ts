import {helpers} from './helpers';

export function getUserInfo(win: any) {
  const {
    navigator,
    userAgent,
    windowOpera,
    intl,
    each,
    extend,
    includes,
    timestamp,
    stripEmptyProperties,
    getQueryParam,
  } = helpers(win);

  // Mostly borrowed from:
  // https://github.com/PostHog/posthog-js/blob/dbfac85a2808626e3c1780013a9075d5c9fd0971/src/utils.js#L1433
  const info = {
    campaignParams: function () {
      const campaign_keywords = 'utm_source utm_medium utm_campaign utm_content utm_term'.split(
        ' '
      );
      let kw = '';
      let params: any = {};

      each(campaign_keywords, function (kwkey: string) {
        kw = getQueryParam(document.URL, kwkey);

        if (kw.length) {
          params[kwkey] = kw;
        }
      });

      return params;
    },

    searchEngine: function (referrer: any) {
      if (referrer.search('https?://(.*)google.([^/?]*)') === 0) {
        return 'google';
      } else if (referrer.search('https?://(.*)bing.com') === 0) {
        return 'bing';
      } else if (referrer.search('https?://(.*)yahoo.com') === 0) {
        return 'yahoo';
      } else if (referrer.search('https?://(.*)duckduckgo.com') === 0) {
        return 'duckduckgo';
      } else {
        return null;
      }
    },

    searchInfo: function (referrer: any) {
      let search = info.searchEngine(referrer);
      let param = search != 'yahoo' ? 'q' : 'p';
      let ret: any = {};

      if (search !== null) {
        ret['$search_engine'] = search;

        var keyword = getQueryParam(referrer, param);
        if (keyword.length) {
          ret['ph_keyword'] = keyword;
        }
      }

      return ret;
    },

    /**
     * This function detects which browser is running this script.
     * The order of the checks are important since many user agents
     * include key words used in later checks.
     */
    browser: function (user_agent: any, vendor: any, opera: any) {
      vendor = vendor || ''; // vendor is undefined for at least IE9
      if (opera || includes(user_agent, ' OPR/')) {
        if (includes(user_agent, 'Mini')) {
          return 'Opera Mini';
        }
        return 'Opera';
      } else if (/(BlackBerry|PlayBook|BB10)/i.test(user_agent)) {
        return 'BlackBerry';
      } else if (
        includes(user_agent, 'IEMobile') ||
        includes(user_agent, 'WPDesktop')
      ) {
        return 'Internet Explorer Mobile';
      } else if (includes(user_agent, 'SamsungBrowser/')) {
        // https://developer.samsung.com/internet/user-agent-string-format
        return 'Samsung Internet';
      } else if (includes(user_agent, 'Edge') || includes(user_agent, 'Edg/')) {
        return 'Microsoft Edge';
      } else if (includes(user_agent, 'FBIOS')) {
        return 'Facebook Mobile';
      } else if (includes(user_agent, 'Chrome')) {
        return 'Chrome';
      } else if (includes(user_agent, 'CriOS')) {
        return 'Chrome iOS';
      } else if (
        includes(user_agent, 'UCWEB') ||
        includes(user_agent, 'UCBrowser')
      ) {
        return 'UC Browser';
      } else if (includes(user_agent, 'FxiOS')) {
        return 'Firefox iOS';
      } else if (includes(vendor, 'Apple')) {
        if (includes(user_agent, 'Mobile')) {
          return 'Mobile Safari';
        }
        return 'Safari';
      } else if (includes(user_agent, 'Android')) {
        return 'Android Mobile';
      } else if (includes(user_agent, 'Konqueror')) {
        return 'Konqueror';
      } else if (includes(user_agent, 'Firefox')) {
        return 'Firefox';
      } else if (
        includes(user_agent, 'MSIE') ||
        includes(user_agent, 'Trident/')
      ) {
        return 'Internet Explorer';
      } else if (includes(user_agent, 'Gecko')) {
        return 'Mozilla';
      } else {
        return '';
      }
    },

    /**
     * This function detects which browser version is running this script,
     * parsing major and minor version (e.g., 42.1). User agent strings from:
     * http://www.useragentstring.com/pages/useragentstring.php
     */
    browserVersion: function (userAgent: any, vendor: any, opera: any) {
      const browser = info.browser(userAgent, vendor, opera);
      const versionRegexs: {[key: string]: RegExp} = {
        'Internet Explorer Mobile': /rv:(\d+(\.\d+)?)/,
        'Microsoft Edge': /Edge?\/(\d+(\.\d+)?)/,
        Chrome: /Chrome\/(\d+(\.\d+)?)/,
        'Chrome iOS': /CriOS\/(\d+(\.\d+)?)/,
        'UC Browser': /(UCBrowser|UCWEB)\/(\d+(\.\d+)?)/,
        Safari: /Version\/(\d+(\.\d+)?)/,
        'Mobile Safari': /Version\/(\d+(\.\d+)?)/,
        Opera: /(Opera|OPR)\/(\d+(\.\d+)?)/,
        Firefox: /Firefox\/(\d+(\.\d+)?)/,
        'Firefox iOS': /FxiOS\/(\d+(\.\d+)?)/,
        Konqueror: /Konqueror:(\d+(\.\d+)?)/,
        BlackBerry: /BlackBerry (\d+(\.\d+)?)/,
        'Android Mobile': /android\s(\d+(\.\d+)?)/,
        'Samsung Internet': /SamsungBrowser\/(\d+(\.\d+)?)/,
        'Internet Explorer': /(rv:|MSIE )(\d+(\.\d+)?)/,
        Mozilla: /rv:(\d+(\.\d+)?)/,
      };
      const regex = versionRegexs[browser];
      if (regex === undefined) {
        return null;
      }
      const matches = userAgent.match(regex);
      if (!matches) {
        return null;
      }

      return parseFloat(matches[matches.length - 2]);
    },

    os: function () {
      const a = userAgent;
      if (/Windows/i.test(a)) {
        if (/Phone/.test(a) || /WPDesktop/.test(a)) {
          return 'Windows Phone';
        }
        return 'Windows';
      } else if (/(iPhone|iPad|iPod)/.test(a)) {
        return 'iOS';
      } else if (/Android/.test(a)) {
        return 'Android';
      } else if (/(BlackBerry|PlayBook|BB10)/i.test(a)) {
        return 'BlackBerry';
      } else if (/Mac/i.test(a)) {
        return 'Mac OS X';
      } else if (/Linux/.test(a)) {
        return 'Linux';
      } else if (/CrOS/.test(a)) {
        return 'Chrome OS';
      } else {
        return '';
      }
    },

    device: function (user_agent: any) {
      if (/Windows Phone/i.test(user_agent) || /WPDesktop/.test(user_agent)) {
        return 'Windows Phone';
      } else if (/iPad/.test(user_agent)) {
        return 'iPad';
      } else if (/iPod/.test(user_agent)) {
        return 'iPod Touch';
      } else if (/iPhone/.test(user_agent)) {
        return 'iPhone';
      } else if (/(BlackBerry|PlayBook|BB10)/i.test(user_agent)) {
        return 'BlackBerry';
      } else if (/Android/.test(user_agent)) {
        return 'Android';
      } else {
        return '';
      }
    },

    referringDomain: function (referrer: string) {
      const split = referrer.split('/');
      if (split.length >= 3) {
        return split[2];
      }
      return '';
    },

    timezone: function (intl: any) {
      try {
        return intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (e) {
        return null;
      }
    },

    properties: function () {
      return extend(
        stripEmptyProperties({
          os: info.os(),
          browser: info.browser(userAgent, navigator.vendor, windowOpera),
          referrer: document.referrer,
          referring_domain: info.referringDomain(document.referrer),
          device: info.device(userAgent),
          time_zone: info.timezone(intl),
        }),
        {
          current_url: win.location.href,
          host: win.location.host,
          pathname: win.location.pathname,
          browser_version: info
            .browserVersion(userAgent, navigator.vendor, windowOpera)
            ?.toString(),
          screen_height: screen.height,
          screen_width: screen.width,
          lib: 'web',
          insert_id:
            Math.random().toString(36).substring(2, 10) +
            Math.random().toString(36).substring(2, 10),
          time: timestamp() / 1000, // epoch time in seconds
        }
      );
    },
  };

  return info.properties();
}

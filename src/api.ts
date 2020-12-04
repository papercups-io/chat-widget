import request from 'superagent';
import {DEFAULT_BASE_URL} from './config';

import {
  WidgetSettings,
} from './types';


export const fetchWidgetSettings = async (
  accountId: string,
  baseUrl = DEFAULT_BASE_URL
): Promise<WidgetSettings> => {
  return request
    .get(`${baseUrl}/api/widget_settings`)
    .query({account_id: accountId})
    .then((res) => res.body.data);
};

export const updateWidgetSettingsMetadata = async (
  accountId: string,
  metadata: any,
  baseUrl = DEFAULT_BASE_URL
): Promise<WidgetSettings> => {
  return request
    .put(`${baseUrl}/api/widget_settings/metadata`)
    .send({account_id: accountId, metadata})
    .then((res) => res.body.data);
};

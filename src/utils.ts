export type User = {
  id: number;
  email: string;
  display_name?: string;
  full_name?: string;
  profile_photo_url?: string;
};

export type Message = {
  body: string;
  created_at: string;
  customer_id?: string;
  user_id?: number;
  user?: User;
  type?: 'bot' | 'agent' | 'customer';
};

export type WidgetConfig = {
  accountId?: string;
  baseUrl?: string;
  title?: string;
  subtitle?: string;
  primaryColor?: string;
  greeting?: string;
  newMessagePlaceholder?: string;
  requireEmailUpfront?: 1 | 0;
  customerId?: string;
};

// TODO: handle this on the server instead
export function now() {
  const date = new Date();

  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}

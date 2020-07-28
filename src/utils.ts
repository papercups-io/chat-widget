export type User = {
  id: number;
  email: string;
  name?: string;
};

export type Message = {
  body: string;
  created_at: string;
  customer_id?: string;
  user_id?: number;
  user?: User;
  type?: 'bot' | 'agent' | 'customer';
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

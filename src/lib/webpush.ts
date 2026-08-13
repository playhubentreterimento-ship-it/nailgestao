import webpush from "web-push";

export const PUBLIC_VAPID_KEY =
  "BEk2Dbi-FF1J64luOs4nM8XwTqAI2IV4rsSh2se6V0ETWtYAHuhNsd6UJjUNMyADVQxUigxkhfKrWF-LbW5Ygwk";

export const PRIVATE_VAPID_KEY = "RrhTneSTKbuVztermqlWZUgFqOqzBhPdUtg8Kz3GogI";

webpush.setVapidDetails(
  "mailto:atendimento@nailgestao.com.br",
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);

export { webpush };

import {
  httpBatchLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from "@trpc/client";
import superjson from "superjson";

export const createTRPCLinks = (url: string) => [
  loggerLink(),
  splitLink({
    condition: (op) => op.type === "subscription",
    true: httpSubscriptionLink({
      url,
      transformer: superjson,
    }),
    false: httpBatchLink({
      url,
      transformer: superjson,
    }),
  }),
];

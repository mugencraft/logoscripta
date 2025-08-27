import type { LinkProps, RegisteredRouter } from "@tanstack/react-router";

export type LinkPropsType = LinkProps<RegisteredRouter["routeTree"]>;

export type LinkParams = {
  label: string;
  link: LinkPropsType;
};

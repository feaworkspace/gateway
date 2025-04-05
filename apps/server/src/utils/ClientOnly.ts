import type { Component, ComponentProps, JSX } from "solid-js";
import {clientOnly} from "@solidjs/start";

export default function ClientOnly(component: Component<any>) {
  return clientOnly(async () => ({default: component}));
}
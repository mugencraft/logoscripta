import { createRoot } from "react-dom/client";

import { App } from "./interfaces/backend/app";

const rootElement = document.getElementById("app") as HTMLElement;

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

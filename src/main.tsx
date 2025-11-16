import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./global.css";
import "@ant-design/v5-patch-for-react-19";

import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true,
  onNeedRefresh() {
    if (confirm("Có phiên bản mới. Tải lại để cập nhật?")) location.reload();
  },
});
// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import LocaleProvider from "./contexts/LocaleContext";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <LocaleProvider>
        <RouterProvider router={router} />
      </LocaleProvider>
    </StrictMode>
  );
}

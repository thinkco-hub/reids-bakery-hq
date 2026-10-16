import { createBrowserRouter } from "react-router";
import App from "./App";

/**
 * The whole app sits under one catch-all route so the shell can keep the feature
 * hooks above the outlet. Changing the history implementation for a host that
 * cannot rewrite paths is a swap in this file alone.
 */
export const router = createBrowserRouter([{ path: "/*", element: <App /> }]);

import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import "./assets/css/tailwind.output.css";
import App from "./App";
import { SidebarProvider } from "./context/SidebarContext";
import ThemedSuspense from "./components/ThemedSuspense";
import { Windmill } from "@windmill/react-ui";
import windmillTheme from "./windmillTheme";

// Sincronizador de modo oscuro: asegura que la clase 'dark' requerida por Tailwind v3
// esté siempre en sincronía con 'theme-dark' de Windmill en el elemento <html>
if (typeof window !== "undefined") {
  const syncDark = () => {
    const isDark =
      document.documentElement.classList.contains("theme-dark") ||
      localStorage.getItem("theme") === "dark";
    if (isDark) {
      if (!document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.add("dark");
      }
    } else {
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
      }
    }
  };
  syncDark();
  const observer = new MutationObserver(() => syncDark());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

ReactDOM.render(
  <SidebarProvider>
    <Suspense fallback={<ThemedSuspense />}>
      <Windmill usePreferences theme={windmillTheme}>
        <App />
      </Windmill>
    </Suspense>
  </SidebarProvider>,
  document.getElementById("root")
);

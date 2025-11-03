import type { Plugin } from "vue";
import logger from "./logger";

export const errorHandler: Plugin = function (app) {
  app.config.errorHandler = (err, instance, info) => {
    logger.error("Vue error:", err, instance, info);
  };

  window.onerror = (message, source, lineno, colno, error) => {
    logger.error("Global error:", { message, source, lineno, colno, error });
  };

  window.onunhandledrejection = (event) => {
    logger.error("Unhandled promise rejection:", event);
  };
};

import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { disableLogger } from "opik";
import { registerOpikCli } from "./src/configure.js";
import { createOpikService } from "./src/service.js";
import { parseOpikPluginConfig } from "./src/types.js";

// Suppress Opik SDK tslog console output
disableLogger();

const plugin = {
  id: "opik-openclaw",
  name: "Opik",
  description: "Export LLM traces and spans to Opik for observability",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    const pluginConfig = parseOpikPluginConfig(api.pluginConfig);
    api.registerService(createOpikService(api, pluginConfig));
    try {
      if (typeof api.registerCli === "function") {
        api.registerCli(
          ({ program }) =>
            registerOpikCli({
              program,
              loadConfig: api.runtime.config.loadConfig,
              writeConfigFile: api.runtime.config.writeConfigFile,
            }),
          { commands: ["opik"] },
        );
      }
    } catch {
      // registerCli is an undocumented API that may be removed in future
      // OpenClaw versions. CLI commands (opik configure/status) will be
      // unavailable, but core tracing functionality is unaffected.
      console.warn(
        "opik: failed to register CLI commands; opik configure/status will not be available",
      );
    }
  },
};

export default plugin;

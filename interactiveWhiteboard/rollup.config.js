import alias from "@rollup/plugin-alias";

// @tldraw/editor package imports "react-dom/client" (for its SVG-export
// feature). react-dom is externalized by pluggable-widgets-tools, but the
// "react-dom/client" subpath is not, so rollup bundles that file's raw CommonJS
// source in full -- including its internal `require('react-dom')` call. That
// literal require() survives into the .mjs (ES module) widget output, where
// Studio Pro's React Client page loader provides no `require` shim, causing
// "require is not defined" error at runtime.

// react-dom's main entry already exports createRoot/hydrateRoot/flushSync, so
// redirecting react-dom/client -> react-dom avoids bundling that file at all.
export default args => {
    const config = args.configDefaultConfig;

    for (const entry of config) {
        if (!entry.output || (entry.output.format !== "amd" && entry.output.format !== "es")) {
            continue;
        }
        entry.plugins.unshift(
            alias({
                entries: [{ find: "react-dom/client", replacement: "react-dom" }]
            })
        );
    }

    return config;
};

System.config({
    baseURL: "/",
    defaultJSExtensions: true,
    transpiler: "traceur",
    paths: {
        "github:*": "jspm_packages/github/*",
        "npm:*": "node_mocules/*"
    },

    map: {
        "traceur": "github:jmcriffey/bower-traceur@0.0.93",
        "traceur-runtime": "github:jmcriffey/bower-traceur-runtime@0.0.93",
        "fs": "npm:fs",
    }
});

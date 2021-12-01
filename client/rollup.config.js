import path from "path"
import resolve from "@rollup/plugin-node-resolve"
import { terser } from "rollup-plugin-terser"
import minifyHTML from "rollup-plugin-minify-html-literals"
import summary from "rollup-plugin-summary"
import typescript from "@rollup/plugin-typescript"
import copy from "rollup-plugin-copy"
import css from "rollup-plugin-import-css"
import alias from "@rollup/plugin-alias"

import commonjs from "@rollup/plugin-commonjs"
import replace from "@rollup/plugin-replace"
import OMT from "@surma/rollup-plugin-off-main-thread"
import { injectManifest } from "rollup-plugin-workbox"
import workboxConfig from "./workbox-config"

const production = !process.env.ROLLUP_WATCH
let env = production ? "production" : "development"

const projectRootDir = path.resolve(__dirname);

let compileWorkers = false
if (production)
    compileWorkers = true

export default [{
    input: "src/main.ts",
    plugins: [
        copy({
            targets: [
                { src: "src/index.html", dest: "dist" },
                { src: "src/manifest.json", dest: "dist" },
                { src: "src/icons.svg", dest: "dist" },
                { src: "src/icons2.svg", dest: "dist" },
                { src: "src/no.json", dest: "dist" }
            ]
        }),
        css({
            include: [
                "**/*.css"
            ],
            output: "bundle.css" 
        }),
        resolve({browser: true}),
        commonjs(),
        typescript(),
        alias({
            entries: [
                { find: "@app", replacement: path.resolve(projectRootDir, "src") },
                { find: "@common", replacement: path.resolve(projectRootDir, "../common") }
            ]
        }),
        minifyHTML(),
        terser({
            ecma: 2020,
            module: true,
            warnings: true,
        }),

        summary(),
    ],
    output: {
        sourcemap: true,
        format: 'esm',
        dir: "dist",
    }
},
{
    input: "src/sw.ts",
    manualChunks: (id) => {
        if (!id.includes("/node_modules/")) {
            return undefined
        }

        const chunkNames = ["workbox"]
        return chunkNames.find((chunkName) => id.includes(chunkName)) || "misc"
    },
    plugins: [
        resolve({browser: true}),
        commonjs(),
        replace({
            "preventAssignment": true,
            "process.env.NODE_ENV": JSON.stringify(env),
        }),
        typescript(),
        alias({
            entries: [
                { find: "@app", replacement: path.resolve(projectRootDir, "src") },
                { find: "@common", replacement: path.resolve(projectRootDir, "../common") }
            ]
        }),
        OMT(),
		injectManifest(workboxConfig),
        terser(),
    ],
    output: {
        sourcemap: true,
        format: "amd",
        dir: "dist",
    }
}]
export default {
    globDirectory: "dist/",
    globPatterns: ["**/*.{css,html,js,svg,json}"],
    maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
    swSrc: "dist/sw.js",
    swDest: "dist/sw.js",
}
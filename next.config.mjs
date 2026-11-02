const config = {
  trailingSlash: true,
  images: { unoptimized: true },
  devIndicators: false,
  ...(process.env.TASB_STATIC_EXPORT === "1" ? { output: "export" } : {}),
};
export default config;

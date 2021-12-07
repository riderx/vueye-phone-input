module.exports = {
  lintOnSave: false,
  publicPath:
    process.env.NODE_ENV === "production" ? "/vue3-phone-input/" : "/",
  configureWebpack: {
    output: {
      libraryExport: "default"
    }
  },
  css: {
    extract: false
  }
};

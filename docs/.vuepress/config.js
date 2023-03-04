const head = require('./config/head.js');
const plugins = require('./config/plugins.js');
const themeConfig = require('./config/themeConfig.js');

module.exports = {
  port: 58080,

  theme: 'vdoing',

  base: '/',
  dest: 'dist',
  locales: {
    '/': {
      title: "ベ断桥烟雨ミの学习笔记",
      description: '学习爱我，我爱学习～',
      lang: 'zh-CN'
    }
  },

  head,
  plugins,
  themeConfig,

  markdown: {
    lineNumber: false
  },
  extendMarkdown: md => {
    md.set({ breaks: true });
    md.use(require('markdown-it-mathjax3'), { tex: { tags: 'ams' } });
    md.use(require('markdown-it-footnote'));
  }
}

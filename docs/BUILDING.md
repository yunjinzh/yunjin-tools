# 静态适配与运行边界

纯前端 React 模块使用共享 React 19、esbuild、Tailwind 构建，保留原页面及组件逻辑。Next Link/Image/Dynamic 在静态环境中使用等价浏览器组件；没有移除依赖后端项目的身份认证。

构建产物保存在 `web/<编号>/`。生成入口会重写已知本地资源路径，并为 localStorage、sessionStorage 与 IndexedDB 添加模块前缀。跨站迁移无法读取旧域名下的个人数据。浏览器扩展与 Windows 程序不会被描述为 Pages 在线程序。

浏览器加载检查验证页面入口、初始渲染、脚本错误与资源请求；不等同于对每项业务功能、真实设备、Windows 运行、第三方收费接口或大型 GPU 模型做完整验收。

提示词画廊的图片地址在生成卡片前经资源映射解析，避免通过 innerHTML 插入的图片绕过路径适配。原站源码保存在 `sources/gis101`，此修正仅作用于 `web/gis101` 发布版本。

GIS101 工具目录的 `/tools/` 索引及 6 个 HTML 子页面一同迁入。发布版本以站内地址读取索引和页面元信息，避免 HTTPS 页面请求旧站 HTTP 内容；原始网页保存在 `sources/gis101/tools`。

教育政策索引（m143）的 PDF 预览按同源模块文件目录校验地址，兼容统一部署后带子路径的资源 URL。原站第 3 版的相对路径限制仅在 `web/m143/app.js` 中适配，`sources/m143` 保留原源码。移动端单列网格允许子项收缩，使司局列表在自身区域滚动，避免撑宽整页。运行 `CHROMIUM_PATH=/usr/bin/chromium node tests/policy-index.mjs` 检查筛选、正文、附件、PDF 预览、CSV 导出及文件校验值；设置 `APP_URL` 后可检验真实发布站点，测试不会替换线上资源。

该版本的一份 PDF 源文件实际为 33 字节网络错误文本。发布版本已从原记录所指的[高校官方附件](https://jwc.czu.cn/_upload/article/files/f1/7d/46260b9c4611875b50aea408d586/8651856b-7bcb-443d-b0bd-3ab5070303d8.pdf)重新取得 8 页 PDF（1041399 字节，SHA-256：`afd10d175c18ebc048412c8f494e7111b44aa3419f38706eff009ea9e0fc3786`），以正确哈希路径保存；源快照保持不变。

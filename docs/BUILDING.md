# 静态适配与运行边界

纯前端 React 模块使用共享 React 19、esbuild、Tailwind 构建，保留原页面及组件逻辑。Next Link/Image/Dynamic 在静态环境中使用等价浏览器组件；没有移除依赖后端项目的身份认证。

构建产物保存在 `web/<编号>/`。生成入口会重写已知本地资源路径，并为 localStorage、sessionStorage 与 IndexedDB 添加模块前缀。跨站迁移无法读取旧域名下的个人数据。浏览器扩展与 Windows 程序不会被描述为 Pages 在线程序。

浏览器加载检查验证页面入口、初始渲染、脚本错误与资源请求；不等同于对每项业务功能、真实设备、Windows 运行、第三方收费接口或大型 GPU 模型做完整验收。

提示词画廊的图片地址在生成卡片前经资源映射解析，避免通过 innerHTML 插入的图片绕过路径适配。原站源码保存在 `sources/gis101`，此修正仅作用于 `web/gis101` 发布版本。

GIS101 工具目录的 `/tools/` 索引及 6 个 HTML 子页面一同迁入。发布版本以站内地址读取索引和页面元信息，避免 HTTPS 页面请求旧站 HTTP 内容；原始网页保存在 `sources/gis101/tools`。

# 镜间造型室

Sites 项目：appgprj_6b022f958c6881918e3e13e5647bc791。

完整素材快照：服装 1407、动画服装 1760、人像 1499、表情 95、发型 122、历代 57、场景 64，共 5004 项；另附姿势 288 项。多角度保留。图片由原来源站托管，未批量转载原图。参考网站：https://posewear.pages.dev/ 。

## 使用

选择人物或上传照片，选择衣装、发型、表情、场景、姿势及妆容，再生成。收藏与选择存 localStorage；造型簿与用户照片存当前浏览器 IndexedDB。生成图片成功后自动保存，可下载与原图对比。

## 当前限制

AI 服务尚未配置，真实图像生成未验证。页面准确显示未开通，不输出伪造换装结果。由所有者通过 OpenAI Developers 的授权流程配置 Sites runtime secret `OPENAI_API_KEY` 后重新部署。可选 `OPENAI_IMAGE_MODEL`，默认 `gpt-image-1.5`。用户端无 Key 配置界面。模型服务可能产生费用；计费与额度需在正式启用前确认。

## 开发

`node scripts/assemble.mjs` 组合 HTML、CSS、客户端、完整目录和服务器处理程序至 worker/index.js。
`node scripts/check.mjs` 校验目录完整性、权限、未配置服务响应及模拟生成请求。
`bash scripts/build.sh` 与 `node scripts/validate-artifact.mjs` 构建与校验 Worker。
`npm run dev -- --port 4173` 为本地预览，绝不加载线上密钥。

## 验证记录

桌面浏览器实测素材显示、搜索粉色、服装选择、发型多角度、造型保存与恢复、未开通服务提示。原站 /m、部分 /i 图片链接返回404，显示改为原图，载入失败回退缩略图。生成接口使用来源白名单、服务端目录 ID 校验、同源 POST、Sites 用户身份验证。频率限制是隔离实例内的尽力保护；正式开放多人使用前应增加持久配额与任务队列。移动端 CSS 已适配，未完成真实设备测试。

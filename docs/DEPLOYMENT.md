# 首次发布与续传

2026-11-17：本地迁移准备及检查已完成。GitHub 连接通过 GraphQL 和 REST 创建仓库均返回 `Resource not accessible by integration`（403），因此尚未创建或上传新仓库，也未发布 Pages 或 Release。此状态是迁移准备时的记录。

## 仓库准备

由账户所有者在 https://github.com/new 创建公开空仓库 `yunjinzh/yunjin-tools`，不初始化 README、许可证或 .gitignore。现有 GitHub 应用选择了全部仓库；创建后重新检查连接能否访问该仓库。

## 上传与部署

```bash
# 默认仅显示本地提交；--publish 才会上传。不会强制覆盖远端历史。
python scripts/publish.py
python scripts/publish.py --publish
```

源文件和资源分批提交。脚本逐次推送，并在重跑时跳过远端已有提交，避免单次上传过大。最后一个提交加入 GitHub Actions 配置，防止未完整上传时开始构建。

在仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。运行或重新运行 `Deploy tools to GitHub Pages` 工作流；成功后访问 https://yunjinzh.github.io/yunjin-tools/ ，检查实际页面与资源请求。

运行 `Publish local program packages` 工作流，将仓库内保存的 Windows 原始分卷合并验证，并发布两个本地程序包至 `v2026.11.17` Release。完整 Windows ZIP 超过 GitHub 单文件限制，因此以原始分卷保存在仓库、完整包保存在 Release。

## 校验与本地预览

```bash
python scripts/build.py
python scripts/validate.py --hashes
python scripts/package_release.py
```

浏览器检查脚本位于 `tests`。按 README 启动本地预览服务后：

```bash
cd tests
npm ci
npx playwright install chromium
npm run smoke
npm run flows
# 已安装系统 Chromium 时可设置 CHROMIUM_PATH。
# 仅检查某项：node smoke.mjs m101
# 发布后检查：APP_URL=https://yunjinzh.github.io/yunjin-tools/ npm run smoke
```

本地 smoke 检查将本仓库的 Raw 资源请求映射到本地已校验文件；线上检查不做此替换。首轮 108 项初始渲染结果及范围说明见 `validation.json`。页面加载通过不代表第三方接口、所有交互或大型模型均已完成端到端验收。

## 尚待补齐

13 项依赖后端的项目已保存源码和原站入口，GitHub Pages 无法运行其服务器、云数据库或平台身份服务；需要另行配置后端部署。19 项未取得源文件的条目保留原交付链接，清单见 `MIGRATION.md`。旧站云数据和浏览器个人数据没有自动迁入。

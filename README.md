# 云金工具集

[在线工具入口](https://yunjinzh.github.io/yunjin-tools/) · [完整迁移清单](docs/MIGRATION.md) · [本地程序下载](https://github.com/yunjinzh/yunjin-tools/releases/tag/v2026.11.17)

> 发布状态（2026-11-17）：统一入口已发布至 GitHub Pages，两个本地程序包已发布至 Releases。见 [首次迁移验证记录](docs/validation-online.json) 和 [部署说明](docs/DEPLOYMENT.md)。

统一收录 156 项网页工具、三维作品、教学应用及本地程序。已取回 137 项源码或程序包：119 项提供网页入口，16 项依赖后端，2 项提供本地安装包；19 项仍待取得原文件。详见迁移清单。

## 使用

打开在线入口，可按分类、关键词和运行方式筛选。网页工具会在新窗口打开。需要后端的项目保留原站入口；本地程序需下载后按原说明运行。

GitHub Pages 只提供静态托管。原有云数据库、附件和平台登录不会随着代码迁移；各工具保存到旧站浏览器中的个人数据也不会自动带过来。重要数据请在原工具中导出，再在支持导入的新版本中恢复。

## 仓库结构

- `modules.json`：全部工具的来源、源码提交、状态和入口。
- `sources/m001` 等：已取回的原项目源码。编号与迁移清单对应。
- `sources/gis101`：原 GIS101 网页与依赖。
- `web/`：验证和部署使用的静态产物。
- `assets/`：去重后的资源文件，按 SHA-256 命名。
- `portal/`：统一工具入口。
- `scripts/`：资源恢复、构建与完整性检查。

## 本地构建入口网站

```bash
python scripts/build.py
python scripts/validate.py --hashes
# 目录名保持 yunjin-tools，以便测试与 GitHub Pages 相同的子路径。
mkdir -p preview
ln -s "$PWD/_site" preview/yunjin-tools
python -m http.server 4173 --directory preview
```

访问 `http://localhost:4173/yunjin-tools/`。Windows 可将 `_site` 复制到 `preview/yunjin-tools` 后运行同一 HTTP 服务命令。

## 开发某个模块

```bash
python scripts/restore_assets.py m003
cd sources/m003
# 接下来按该模块 README 安装依赖、构建与启动。
```

恢复脚本把资源放回原始路径。原路径已加入 `.gitignore`，避免把同一资源重复提交。更新功能时请同时更新对应 `web/` 静态产物及其资源映射，然后运行构建与验证。不能静态导出的项目需要独立后端环境，不应删除认证逻辑来强行部署到 Pages。

## 部署

已配置 GitHub Actions Pages 工作流。首次发布需先创建仓库，并在 Settings → Pages 中选择 GitHub Actions。推送 `main` 后，工作流检查资源完整性、构建入口和网页目录，再发布到 GitHub Pages。构建大小检查限制为 950 MiB，以留出托管空间余量。

大型完整 Windows 包通过 GitHub Releases 提供。图片与部分媒体资源直接读取本仓库的 Raw 地址，因此首次访问仍需要网络。

## 自动同步

已启用每小时检查可访问的 Sites 和工具总目录的自动任务，发现新增工具及版本更新，使用稳定编号增量合并，再构建、验证和发布。定时检查由 ChatGPT 自动任务执行，GitHub Actions 负责部署。仅存在于聊天中的附件需要先有可读取的来源。详见 [自动同步说明](docs/AUTO-SYNC.md) 和 [同步状态](sync/state.json)、[最近同步结果](sync/reports/latest.json)。

## 许可

保留各原模块与第三方依赖已有的许可文件。本次迁移未为未注明许可的原作品新增开源授权。

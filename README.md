# DSH Daily Fortune

独立的 DeepSeek Harness Profile Bundle，提供「今日一签」会话页、输入区抽签按钮、观音灵签、塔罗牌阵、每日名言与设置面板。

## 兼容性

- DSH `0.0.1-rc.2`
- Node.js `^22.19.0 || >=24`
- Web profile

插件使用自己的同源设置 API，不依赖 DSH 核心 settings RPC 的 namespace allowlist。设置仍由 Host 的 `dsh-settings` 服务持久化。

## 安装

```bash
dsh plugin --profile web add ./deepseek-ai-dsh-daily-fortune-0.1.0.tgz
dsh web --profile web
```

`package.json#dsh.bundle.patch` 会自动应用 `cordis.patch.yml`。不要再手工向 profile 插入同名 entry，否则会触发 duplicate loader entry id。

## 开发与验收

```bash
npm ci
DSH_WORKSPACE_ROOT=/path/to/deepseek-harness npm run setup:dsh-workspace
npm run typecheck
npm test
npm run build
npm pack
```

发布前应在全新的 `DSH_HOME` 中从 tarball 安装，检查 `dump-config` 仅出现一条 `daily-fortune`，再做真实 Web 启动和 `/plugins/dsh-daily-fortune/api/settings` smoke。

## 权限、网络与限制

- Host 会按用户操作访问 `zenquotes.io`、`stoic.tekloon.net`、`api.adviceslip.com` 与 `tarotapi.dev`；不需要 API Key。
- 外部服务失败时名言/塔罗增强会降级，内置签文与本地塔罗数据仍可用。
- 设置 API 与上游代理均使用同源 HTTP；不要将 DSH Web 端口暴露到不可信网络。
- 本项目当前为本地私有原型，不配置远端仓库，也不自动发布 npm。

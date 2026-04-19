# shared/theme

当前正式的 UI 主题入口是 `editorial-paper/`。

- `editorial-paper/`
  - 新的正式主题系统入口
  - 服务后续所有新页面与新 widgets
  - 仅 `Fraunces` 作为本地打包字体保留
  - 正文与辅助文字默认使用 iOS / Android 各自原生 sans-serif
- `colors.ts`
  - 当前未迁移页面的遗留主题文件
  - 只用于维持旧页面运行
  - 不允许继续扩展

当仓库中不再有旧页面依赖模板遗留 theme 后，`colors.ts` 与旧 `Themed* / constants/theme / use-theme` 体系应整体删除。

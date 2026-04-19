# shared/theme

当前正式的 UI 主题入口是 `editorial-paper/`。

- `editorial-paper/`
  - 新的正式主题系统入口
  - 服务后续所有新页面与新 widgets
  - 本地打包字体包含 `Fraunces` 与 `TW-Kai-98_1`
  - 正文与辅助文字默认使用 iOS / Android 各自原生 sans-serif

旧 `Themed* / constants/theme / use-theme / colors.ts` 体系已经移除，后续新页面不得重新引入第二套主题入口。

# shared/theme

当前正式的 UI 主题入口是 `editorial-paper/`。

- `editorial-paper/`
  - 新的正式主题系统入口
  - 服务后续所有新页面与新 widgets
  - `Fraunces` 通过 Expo font plugin 原生预打包，作为启动关键字体
  - `TW-Kai-98_1` 保持 repo-local 资产，但默认在运行时后台加载，不阻塞 root 启动
  - 正文与辅助文字默认使用 iOS / Android 各自原生 sans-serif

旧 `Themed* / constants/theme / use-theme / colors.ts` 体系已经移除，后续新页面不得重新引入第二套主题入口。

# shared/lib

`shared/lib` 放与具体业务无关、但又不属于视觉原语的通用基础能力。

当前目录包括：

- `startup/`
  - root 启动阶段的状态机与时间常量
- `react-query/`
  - QueryClient 初始化与应用级数据缓存基础设施
- `modal/`
  - 全局 modal 基座的命令层和状态层
  - 只维护 stack、phase 和 dismiss 语义
- `toast/`
  - 全局 `Top Toast` 的命令层和状态层
  - 不包含 React 视图

约束：

- 这里不放页面模板和业务视图
- 这里的模块可以被 `app / pages / widgets / features / entities` 读取
- 视觉实现应继续放在 `shared/ui/`

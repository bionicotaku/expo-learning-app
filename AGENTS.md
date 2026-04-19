# Agents

本文件定义本仓库内 agent 的默认执行规则。
调用 Subagent 完全不允许自定义模型, 必须直接继承当前会话模型

## graphify

This project will have a graphify knowledge graph at graphify-out/.
If the directory does not exist yet, skip graph-related steps for now.
You can ignore the git change of this directory after it is created.

Rules:

- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure once that file exists
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current once graphify is set up in this repo

## 工作原则

1. 先读文档，再读代码，再动手实现。
2. 先搜索已有实现，不重复造轮子。
3. 不做向后兼容；以当前结构最优为准。
4. 不保留兼容壳、旧路径、旧表 owner、旧脚本。
5. 每次只基于当前有效文档和当前代码结构行动。

## 执行要求

1. 涉及任务列表时，每完成一条，先更新任务文档，再继续下一条。
2. 日常编码过程中的快速回归，默认先执行 `npm run quick-check`。
3. 如果改动涉及相关模块的 integration 测试范围，补跑对应的 integration test。
4. 标准最终验收必须执行 `npm run check`。只变更了文档等非代码部分则不用。
5. 任务若有额外验收要求，在 `npm run check` 之外补跑；如果改动影响 Expo 页面、路由或原生播放行为，补做一次 `npm run ios` 启动验证。
6. 改动前先确认模块边界，不跨模块偷放职责。
7. 能删除的旧实现就直接删除，不留“后面再清理”。

## 文档规则

1. 设计文档放在 `docs/`，代码说明文档放在各目录的 `README.md`。
2. 文档映射保持一致：`docs/` 定义设计，代码实现当前落在 `src/`，目录级 `README.md` 解释当前实现。
3. 新模块或新的文件结构，默认必须遵循 `docs/项目规范.md`；如果规范尚未覆盖某个场景，再以当前目录结构和已存在实现为准。
4. 如确有必要偏离统一结构，可以自定义，但必须在对应目录的 `README.md` 中明确写出：
   - 为什么要偏离
   - 偏离了哪一条标准
   - 自定义结构的边界和维护约束
5. 代码改动如果影响结构、边界、调用关系、文件布局或维护方式，必须同步更新对应文档。
6. 文档以“方便新人接手维护”为标准，优先写清：
   - 文件结构
   - 模块职责
   - 边界
   - 依赖关系
   - 主要调用链
7. 临时文档放到 `docs/temp/`；不要把过程性文档长期留在主目录。

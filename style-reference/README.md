# style-reference

这个目录是视觉参考资产，不是产品实现目录。

- [index.html](/Users/evan/Code/learning%20app/test-expo/style-reference/index.html) 是给人直接打开看的入口，适合通过本地静态服务浏览整套设计板。
- [visual-reference-base.jsx](/Users/evan/Code/learning%20app/test-expo/style-reference/visual-reference-base.jsx) 是给人看的展示基座，只负责画布、iPhone 外壳和看稿体验；agent 可以忽略它。
- [style-reference-main.jsx](/Users/evan/Code/learning%20app/test-expo/style-reference/style-reference-main.jsx) 是最重要的设计源文件，也是 agent 读取 Style C 风格时的主要参考。

推荐从仓库根目录启动一个简单静态服务后再打开，例如：

```bash
python3 -m http.server 4173
```

然后访问 `http://localhost:4173/style-reference/`。

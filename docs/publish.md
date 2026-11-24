# 发布物料 · lecture-forge

> 各渠道可直接复制粘贴的文案。改一下日期/个人化的地方就能发。

---

## 1. V2EX（分享创造节点）

**标题**：我把 200 页 PPT 变成了能提问的网页讲义，做了个工具

**正文**：

```
最近上了一个两天集训营，官方讲义是 7 份 PPT、200 多页。

问题不是信息不够，是 PPT 本身就是为「讲的人」设计的：一页十几个要点、
公式没有推导、概念之间没有过渡。自己看的时候，缺的不是信息，是结构和坡度。

所以我做了一件事：把每讲重写成一份单文件 HTML 讲义。

结构上分三层：
- 入门版卡片（3 条要点 + 1 个最关键公式）—— 五分钟过一遍有地图
- 动态示意（3–5 步，点播放自动演）—— 抽象概念看它怎么发生
- 精读（公式编号、对比表、逐行注释的代码）—— 真要搞懂的时候

技术上：KaTeX（含字体）+ CSS 全部内联，单文件 700 KB 起，
双击就开，完全离线。

后来发现这套结构跟具体课程无关，就抽出来做成了通用工具：

https://github.com/JimmyWangJimmy/lecture-forge

三种用法：
1. 作为 AI agent 的 skill（Claude Code / DSH / Cursor）—— 丢进 skills 目录，
   说「把这份 PPT 做成讲义」就行
2. 命令行：extract.py → 写 JSON → render.mjs → check.py
3. 纯浏览器：上传文件、填 API key、生成下载

最关键的不是代码，是 SKILL.md 里写死的工作流。特别是第二步：
「先自己读一遍定骨架，再动笔」—— 直接让模型总结，出来的结构会跟着
PPT 页序走，而不是跟着知识结构走。

效果图：
[首屏] https://github.com/JimmyWangJimmy/lecture-forge/blob/main/docs/screenshots/hero.webp

用这个做的实例（四份真实讲义，可以看质量）：
https://jimmywangjimmy.github.io/cann-bootcamp-notes/

MIT，欢迎提意见。
```

---

## 2. 掘金 / 思否（技术文章）

**标题**：把 PPT 变成讲义：一套分层阅读的结构设计

**大纲**：

1. **问题**：PPT 是为讲者设计的，读者缺的是坡度
2. **三层结构**（入门版 / 动画 / 精读）—— 每层解决什么问题
3. **为什么是单文件 HTML**：KaTeX 内联的代价与收益（700 KB vs 零依赖）
4. **JSON 中间层**：为什么不直接生成 HTML（可审阅、可复用、可换模板）
5. **AI 助教的上下文设计**：五层上下文 ≈ 2500 token 的做法
6. **踩坑记录**：
   - 模板字符串生成代码时，`\s\d` 会被转义吃掉（`[sd]`）
   - `position: sticky` 在 grid 容器里会失效，改 `fixed` + `margin-left`
   - 一个多余的 `</div>` 让公式块跑到 `<body>` 下，找了两小时
7. **工具与仓库**

---

## 3. Show HN

**Title**: Show HN: Turn any slide deck into a layered, offline-readable HTML lecture

**Body**:

```
I spent two days at a bootcamp whose material was 7 deck files, 200+ slides.

The problem wasn't lack of information — presentation decks are designed for
a speaker: 15 bullets per slide, formulas without derivation, no transitions
between concepts. Reading them alone, what's missing is structure and gradient.

So I rewrote each lecture as a single-file HTML document with three layers:

- Primer card (3 takeaways + the one formula that matters) — 5-min pass, you get a map
- Animated walkthrough (3-5 steps, click to play) — for abstract processes
- Deep read (numbered equations, comparison tables, line-commented code)

Tech: KaTeX (with 20 font files as base64) + CSS all inlined. One file, ~700 KB,
opens offline, zero dependencies.

Then I realized the structure is content-agnostic, so I extracted the tool:

https://github.com/JimmyWangJimmy/lecture-forge

Usable as an agent skill (drop into Claude Code / Cursor skills dir), as a CLI,
or in-browser.

The most important part isn't the code — it's the workflow in SKILL.md. Step 2 says:
"read it yourself and decide the chapter structure before writing anything."
If you let the model summarize directly, the structure follows slide order
instead of knowledge structure.

MIT. Feedback welcome.
```

---

## 4. 小红书 / 即刻（短文案）

```
花两天做了一件小事：把 200 页 PPT 改成了「能读的」网页讲义 📖

原来的 PPT：一页 15 个要点，公式没推导，概念之间没过渡
改完以后分三层：
🟢 入门版：3 条要点 + 1 个关键公式，5 分钟有地图
🔵 动画：抽象过程 3-5 步，点播放自动演
⚪️ 精读：公式编号、对比表、逐行注释的代码

最爽的是：单个 HTML 文件，双击就开，完全离线，
手机上也能看（响应式 + 深色模式）。

后来发现这套结构跟课程无关，就抽成了通用工具，
现在丢一份 PPT 给它，自动生成同样结构的讲义。

🔗 github.com/JimmyWangJimmy/lecture-forge
🔗 实例：jimmywangjimmy.github.io/cann-bootcamp-notes

#效率工具 #学习方法 #AI工具 #开源
```

---

## 5. awesome-claude-code / awesome-ai-tools PR 条目

提交到 [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)：

```markdown
- [lecture-forge](https://github.com/JimmyWangJimmy/lecture-forge) — Turn PPT/PDF/DOCX/Markdown into layered single-file HTML lectures. Three reading levels per chapter (primer / animated walkthrough / deep read), inlined KaTeX, offline-ready output.
```

其他可能收的列表：
- `awesome-ai-agents`
- `awesome-llm-apps`
- `awesome-study-tools`
- `awesome-education`

PR 时注意：多数 awesome list 要求**先 star、格式统一、按字母序插入**。

---

## 6. GitCode（CANN 笔记专用）

GitCode 支持 **仓库镜像**：设置 → 仓库管理 → 镜像管理 → 从 GitHub 拉取。
这样不用重新推，GitHub 更新后自动同步。

地址：https://docs.gitcode.com/docs/help/home/org_project/project_manage/project_settings/repository_mirroring/

针对 `cann-bootcamp-notes`，还可以直接给 CANN 社区提 issue/PR 建议收录。

---

## 7. 昇腾社区 / CANN 论坛

- 昇腾社区：https://www.hiascend.com/ （可发博客）
- CANN 论坛：https://bbs.huaweicloud.com/forum/forum-1109-1.html

发的角度不要是「我做了个项目」，而是「启航营第 4 讲的算子开发，我整理了一份逐行注释的笔记」—— 对社区有实际价值，才容易被收录。

---

## 发布顺序建议

| 顺序 | 渠道 | 为什么 |
|---|---|---|
| 1 | GitCode 镜像 | 零成本，CANN 学员都在那 |
| 2 | V2EX 分享创造 | 中文开发者第一站，反馈快 |
| 3 | 掘金长文 | 沉淀，长期被搜到 |
| 4 | awesome list PR | 长尾流量，一次提交长期有效 |
| 5 | Show HN | 英文受众，质量反馈 |
| 6 | 小红书/即刻 | 破圈，非技术受众 |

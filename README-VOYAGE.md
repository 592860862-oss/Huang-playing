# Voyage 旅行分享

Cloudflare Pages 使用 GitHub main 分支自动发布。框架：无；构建命令：留空；输出目录：public。

多人待办需要 D1 数据库。在 D1 控制台执行 schema.sql，在 Pages 的设置 → 绑定添加 D1，变量名 VOYAGE_DB，之后重新部署。

public/trips/<随机分享标识>/index.html 是旅行手册；同目录 state.json 仅包含公开清单和内容版本。不要上传软件数据库、API 密钥、订单截图或私人订单字段。

functions/api/trips/[token].js 只允许持有链接的人修改已经公开的清单条目，不能写入任意旅行内容。

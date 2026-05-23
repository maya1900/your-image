# 界面截图

把以下三张 JPG 截图放到这个目录里，README 会自动展示：

| 文件名 | 内容 |
|---|---|
| `create.jpg` | 创作页（含 Prompt 框、风格预设、生成结果） |
| `gallery.jpg` | 画廊页（含 Lightbox 或网格视图） |
| `settings.jpg` | 设置页（含 API Key 输入与连通状态） |

**推荐尺寸**：宽度 ≤ 2000px，JPG 质量 ~82，单张 < 200KB。
压缩命令参考：
```bash
magick input.png -resize "2000x>" -quality 82 -strip output.jpg
```


#!/bin/bash

# 遍历当前目录的所有 .ogg 文件
for file in *.ogg; do
    # 检查是否有 .ogg 文件存在
    [ -e "$file" ] || continue

    # 获取文件名（不含扩展名）
    filename="${file%.ogg}"

    # 转换为 m4a
    ffmpeg -i "$file" -q:a 2 "${filename}.m4a"

    # 检查转换是否成功
    if [ $? -eq 0 ]; then
        echo "Converted and removed: $file"
    else
        echo "Failed to convert: $file"
    fi
done

#!/usr/bin/env python3
"""
检查前端代码中的硬编码中文文案
"""

import os
import re
from pathlib import Path

def contains_chinese(text):
    """检查文本是否包含中文字符"""
    return bool(re.search(r'[\u4e00-\u9fff]', text))

def check_file(file_path):
    """检查单个文件中的硬编码中文"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        issues = []
        for line_num, line in enumerate(lines, 1):
            # 跳过注释行
            if line.strip().startswith('//') or line.strip().startswith('/*'):
                continue
            
            # 检查是否包含中文
            if contains_chinese(line):
                # 排除一些特殊情况
                if 'messages/' in str(file_path):  # 翻译文件
                    continue
                if '.json' in str(file_path):  # JSON文件
                    continue
                if 'node_modules' in str(file_path):  # 依赖包
                    continue
                
                issues.append({
                    'line': line_num,
                    'content': line.strip(),
                    'file': str(file_path)
                })
        
        return issues
    except Exception as e:
        print(f"检查文件 {file_path} 时出错: {e}")
        return []

def main():
    """主函数"""
    frontend_dir = Path('.')
    
    # 要检查的文件扩展名
    extensions = ['.tsx', '.ts', '.jsx', '.js']
    
    all_issues = []
    
    # 遍历所有相关文件
    for ext in extensions:
        for file_path in frontend_dir.rglob(f'*{ext}'):
            # 跳过一些目录
            if any(skip in str(file_path) for skip in ['node_modules', '.next', 'dist', 'build']):
                continue
            
            issues = check_file(file_path)
            all_issues.extend(issues)
    
    # 输出结果
    if all_issues:
        print("发现以下硬编码中文文案：\n")
        for issue in all_issues:
            print(f"文件: {issue['file']}")
            print(f"行号: {issue['line']}")
            print(f"内容: {issue['content']}")
            print("-" * 50)
    else:
        print("✅ 未发现硬编码中文文案")

if __name__ == "__main__":
    main()

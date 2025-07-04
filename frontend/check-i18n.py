#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
多语言键值完整性检查工具
检查所有语言文件的键值一致性、未翻译内容和代码中使用的翻译键
"""

import json
import os
import re
import glob
from collections import defaultdict

def get_all_keys(obj, prefix=''):
    """递归获取所有键值路径"""
    keys = set()
    if isinstance(obj, dict):
        for key, value in obj.items():
            current_key = f'{prefix}.{key}' if prefix else key
            if isinstance(value, dict):
                keys.update(get_all_keys(value, current_key))
            else:
                keys.add(current_key)
    return keys

def find_untranslated(obj, lang_code, prefix=''):
    """查找未翻译的内容"""
    untranslated = []
    untranslated_markers = [
        '待翻译', 'يحتاج ترجمة', 'अनुवाद की आवश्यकता', 
        'Gen pou tradwi', 'Need translation', 'TODO:', 'FIXME:'
    ]
    
    if isinstance(obj, dict):
        for key, value in obj.items():
            current_key = f'{prefix}.{key}' if prefix else key
            if isinstance(value, dict):
                untranslated.extend(find_untranslated(value, lang_code, current_key))
            elif isinstance(value, str):
                # 检查是否包含未翻译的标记
                for marker in untranslated_markers:
                    if marker in value:
                        untranslated.append((current_key, value[:100] + '...' if len(value) > 100 else value))
                        break
    return untranslated

def find_translation_keys_in_code():
    """在代码中查找使用的翻译键"""
    used_keys = set()
    translation_patterns = [
        r"useTranslations\(['\"]([^'\"]+)['\"]\)",  # useTranslations('key')
        r"t\(['\"]([^'\"]+)['\"]\)",                # t('key')
        r"tNav\(['\"]([^'\"]+)['\"]\)",             # tNav('key')
        r"tLayout\(['\"]([^'\"]+)['\"]\)",          # tLayout('key')
        r"tCommon\(['\"]([^'\"]+)['\"]\)",          # tCommon('key')
    ]
    
    # 搜索所有相关文件
    file_patterns = [
        'components/**/*.tsx',
        'components/**/*.ts',
        'app/**/*.tsx',
        'app/**/*.ts',
        'lib/**/*.tsx',
        'lib/**/*.ts',
    ]
    
    for pattern in file_patterns:
        for file_path in glob.glob(pattern, recursive=True):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # 查找翻译键使用
                    for regex_pattern in translation_patterns:
                        matches = re.findall(regex_pattern, content)
                        for match in matches:
                            used_keys.add(match)
                            
            except Exception as e:
                print(f"读取文件错误 {file_path}: {e}")
    
    return used_keys

def main():
    print("🔍 多语言键值完整性检查")
    print("=" * 50)
    
    # 1. 加载所有语言文件
    languages = {}
    messages_dir = 'messages'
    
    if not os.path.exists(messages_dir):
        print(f"❌ 找不到 {messages_dir} 目录")
        return
    
    for file in os.listdir(messages_dir):
        if file.endswith('.json'):
            lang_code = file.replace('.json', '')
            try:
                with open(f'{messages_dir}/{file}', 'r', encoding='utf-8') as f:
                    languages[lang_code] = json.load(f)
            except Exception as e:
                print(f"❌ 加载 {file} 失败: {e}")
    
    if not languages:
        print("❌ 没有找到有效的语言文件")
        return
    
    # 2. 以英文为基准检查键值一致性
    if 'en' not in languages:
        print("❌ 找不到英文基准文件 (en.json)")
        return
    
    en_keys = get_all_keys(languages['en'])
    print(f"📊 英文基准键值数量: {len(en_keys)}")
    print()
    
    # 3. 检查每种语言
    summary = {
        'complete': [],
        'missing_keys': [],
        'extra_keys': [],
        'untranslated': []
    }
    
    for lang_code, data in sorted(languages.items()):
        if lang_code == 'en':
            continue
            
        print(f"🌍 检查 {lang_code.upper()} 语言")
        print("-" * 30)
        
        lang_keys = get_all_keys(data)
        missing_keys = en_keys - lang_keys
        extra_keys = lang_keys - en_keys
        untranslated = find_untranslated(data, lang_code)
        
        print(f"键值数量: {len(lang_keys)}")
        
        if missing_keys:
            print(f"❌ 缺失键值: {len(missing_keys)} 个")
            summary['missing_keys'].append(lang_code)
            for key in sorted(list(missing_keys)[:3]):
                print(f"   - {key}")
            if len(missing_keys) > 3:
                print(f"   ... 还有 {len(missing_keys) - 3} 个")
        
        if extra_keys:
            print(f"⚠️  多余键值: {len(extra_keys)} 个")
            summary['extra_keys'].append(lang_code)
            for key in sorted(list(extra_keys)[:3]):
                print(f"   + {key}")
        
        if untranslated:
            print(f"🔄 未翻译内容: {len(untranslated)} 个")
            summary['untranslated'].append(lang_code)
            for key, value in untranslated[:3]:
                print(f"   * {key}: {value}")
            if len(untranslated) > 3:
                print(f"   ... 还有 {len(untranslated) - 3} 个")
        
        if not missing_keys and not extra_keys and not untranslated:
            print("✅ 完全一致，无未翻译内容")
            summary['complete'].append(lang_code)
        
        print()
    
    # 4. 检查代码中使用的翻译键
    print("🔍 检查代码中使用的翻译键")
    print("-" * 30)
    used_keys = find_translation_keys_in_code()
    print(f"代码中使用的翻译键: {len(used_keys)} 个")
    
    # 检查是否有使用了但未定义的键
    undefined_keys = []
    for key in used_keys:
        if key not in en_keys:
            # 检查是否是命名空间
            namespace_exists = any(en_key.startswith(key + '.') for en_key in en_keys)
            if not namespace_exists:
                undefined_keys.append(key)
    
    if undefined_keys:
        print(f"❌ 代码中使用但未定义的键: {len(undefined_keys)} 个")
        for key in sorted(undefined_keys)[:5]:
            print(f"   - {key}")
    else:
        print("✅ 所有使用的翻译键都已定义")
    
    print()
    
    # 5. 总结报告
    print("📋 总结报告")
    print("=" * 50)
    print(f"✅ 完全正确的语言: {len(summary['complete'])} 个")
    if summary['complete']:
        print(f"   {', '.join(summary['complete'])}")
    
    print(f"❌ 有缺失键值的语言: {len(summary['missing_keys'])} 个")
    if summary['missing_keys']:
        print(f"   {', '.join(summary['missing_keys'])}")
    
    print(f"⚠️  有多余键值的语言: {len(summary['extra_keys'])} 个")
    if summary['extra_keys']:
        print(f"   {', '.join(summary['extra_keys'])}")
    
    print(f"🔄 有未翻译内容的语言: {len(summary['untranslated'])} 个")
    if summary['untranslated']:
        print(f"   {', '.join(summary['untranslated'])}")
    
    # 6. 建议
    print()
    print("💡 建议")
    print("-" * 20)
    if summary['untranslated']:
        print("1. 优先处理未翻译内容，特别是中文、阿拉伯语、印地语、海地克里奥尔语")
    if summary['missing_keys']:
        print("2. 补充缺失的翻译键值")
    if summary['extra_keys']:
        print("3. 清理多余的键值或添加到英文基准")
    if undefined_keys:
        print("4. 修复代码中使用但未定义的翻译键")
    
    if not any([summary['missing_keys'], summary['extra_keys'], summary['untranslated'], undefined_keys]):
        print("🎉 所有多语言配置都是完整和一致的！")

if __name__ == '__main__':
    main()

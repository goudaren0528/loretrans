#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动翻译多语言文件脚本
使用我们自己的 Hugging Face Space API 来翻译所有未翻译的界面文案
"""

import json
import os
import time
import requests
from typing import Dict, Any, List, Tuple

# 语言映射配置
LANGUAGE_MAPPING = {
    'zh': 'zho_Hans',  # 中文简体
    'ar': 'arb_Arab',  # 阿拉伯语
    'hi': 'hin_Deva',  # 印地语
    'ht': 'hat_Latn',  # 海地克里奥尔语
    'es': 'spa_Latn',  # 西班牙语
    'fr': 'fra_Latn',  # 法语
    'lo': 'lao_Laoo',  # 老挝语
    'my': 'mya_Mymr',  # 缅甸语
    'pt': 'por_Latn',  # 葡萄牙语
    'sw': 'swh_Latn',  # 斯瓦希里语
    'te': 'tel_Telu',  # 泰卢固语
}

# Hugging Face Space API 配置
HF_SPACE_URL = "https://wane0528-my-nllb-api.hf.space/api/v4/translator"
SOURCE_LANG = "eng_Latn"  # 英语

class TranslationService:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Transly-AutoTranslate/1.0'
        })
    
    def translate_text(self, text: str, target_lang: str, max_retries: int = 3) -> str:
        """翻译单个文本"""
        if not text or not text.strip():
            return text
            
        payload = {
            "text": text,
            "source": SOURCE_LANG,
            "target": target_lang
        }
        
        for attempt in range(max_retries):
            try:
                print(f"  翻译: {text[:50]}{'...' if len(text) > 50 else ''}")
                response = self.session.post(HF_SPACE_URL, json=payload, timeout=30)
                
                if response.status_code == 200:
                    result = response.json()
                    if 'result' in result:
                        translated = result['result'].strip()
                        print(f"  结果: {translated[:50]}{'...' if len(translated) > 50 else ''}")
                        return translated
                    else:
                        print(f"  ⚠️ API响应格式异常: {result}")
                else:
                    print(f"  ❌ API错误 {response.status_code}: {response.text}")
                    
            except requests.exceptions.RequestException as e:
                print(f"  ❌ 网络错误 (尝试 {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # 指数退避
                    
        print(f"  ❌ 翻译失败，保持原文: {text}")
        return text
    
    def translate_batch(self, texts: List[str], target_lang: str) -> List[str]:
        """批量翻译文本"""
        results = []
        for i, text in enumerate(texts):
            print(f"  进度: {i + 1}/{len(texts)}")
            translated = self.translate_text(text, target_lang)
            results.append(translated)
            # 避免API限流
            time.sleep(0.5)
        return results

def find_untranslated_content(obj: Dict[str, Any], lang_code: str, prefix: str = '') -> List[Tuple[str, str]]:
    """查找未翻译的内容"""
    untranslated = []
    untranslated_markers = {
        'zh': '待翻译',
        'ar': 'يحتاج ترجمة', 
        'hi': 'अनुवाद की आवश्यकता',
        'ht': 'Gen pou tradwi'
    }
    
    marker = untranslated_markers.get(lang_code, '待翻译')
    
    if isinstance(obj, dict):
        for key, value in obj.items():
            current_key = f'{prefix}.{key}' if prefix else key
            if isinstance(value, dict):
                untranslated.extend(find_untranslated_content(value, lang_code, current_key))
            elif isinstance(value, str) and marker in value:
                untranslated.append((current_key, value))
    
    return untranslated

def update_translation_in_dict(obj: Dict[str, Any], key_path: str, new_value: str) -> None:
    """更新字典中的翻译值"""
    keys = key_path.split('.')
    current = obj
    
    for key in keys[:-1]:
        if key not in current:
            current[key] = {}
        current = current[key]
    
    current[keys[-1]] = new_value

def translate_language_file(lang_code: str, en_data: Dict[str, Any], translator: TranslationService) -> Dict[str, Any]:
    """翻译整个语言文件"""
    print(f"\n🌍 开始翻译 {lang_code.upper()} 语言文件")
    print("=" * 50)
    
    # 加载现有的语言文件
    lang_file = f'messages/{lang_code}.json'
    if os.path.exists(lang_file):
        with open(lang_file, 'r', encoding='utf-8') as f:
            lang_data = json.load(f)
    else:
        lang_data = {}
    
    # 查找未翻译的内容
    untranslated = find_untranslated_content(lang_data, lang_code)
    
    if not untranslated:
        print("✅ 该语言文件已完全翻译")
        return lang_data
    
    print(f"📝 发现 {len(untranslated)} 个未翻译项目")
    
    # 获取对应的英文原文
    target_lang = LANGUAGE_MAPPING.get(lang_code)
    if not target_lang:
        print(f"❌ 不支持的语言代码: {lang_code}")
        return lang_data
    
    translated_count = 0
    
    for key_path, current_value in untranslated:
        try:
            # 获取英文原文
            keys = key_path.split('.')
            en_text = en_data
            for key in keys:
                if isinstance(en_text, dict) and key in en_text:
                    en_text = en_text[key]
                else:
                    en_text = None
                    break
            
            if not en_text or not isinstance(en_text, str):
                print(f"  ⚠️ 跳过 {key_path}: 找不到英文原文")
                continue
            
            print(f"\n📍 翻译键值: {key_path}")
            print(f"  英文原文: {en_text}")
            
            # 翻译文本
            translated_text = translator.translate_text(en_text, target_lang)
            
            if translated_text and translated_text != en_text:
                # 更新翻译
                update_translation_in_dict(lang_data, key_path, translated_text)
                translated_count += 1
                print(f"  ✅ 翻译完成")
            else:
                print(f"  ⚠️ 翻译失败或无变化")
                
        except Exception as e:
            print(f"  ❌ 处理错误 {key_path}: {e}")
    
    print(f"\n📊 翻译统计: {translated_count}/{len(untranslated)} 项成功翻译")
    return lang_data

def main():
    print("🚀 自动翻译多语言界面文案")
    print("使用 Hugging Face Space API")
    print("=" * 60)
    
    # 检查消息目录
    if not os.path.exists('messages'):
        print("❌ 找不到 messages 目录")
        return
    
    # 加载英文基准文件
    try:
        with open('messages/en.json', 'r', encoding='utf-8') as f:
            en_data = json.load(f)
        print(f"✅ 加载英文基准文件: {len(en_data)} 个顶级键")
    except Exception as e:
        print(f"❌ 加载英文文件失败: {e}")
        return
    
    # 初始化翻译服务
    translator = TranslationService()
    
    # 测试API连接
    print("\n🔍 测试翻译API连接...")
    test_result = translator.translate_text("Hello", LANGUAGE_MAPPING['zh'])
    if test_result and test_result != "Hello":
        print("✅ API连接正常")
    else:
        print("❌ API连接失败，请检查网络和服务状态")
        return
    
    # 需要翻译的语言（有未翻译内容的）
    languages_to_translate = ['zh', 'ar', 'hi', 'ht']
    
    print(f"\n📋 计划翻译语言: {', '.join(languages_to_translate)}")
    
    # 逐个处理语言文件
    for lang_code in languages_to_translate:
        try:
            translated_data = translate_language_file(lang_code, en_data, translator)
            
            # 保存翻译结果
            output_file = f'messages/{lang_code}.json'
            backup_file = f'messages/{lang_code}.json.backup'
            
            # 创建备份
            if os.path.exists(output_file):
                with open(output_file, 'r', encoding='utf-8') as f:
                    backup_data = f.read()
                with open(backup_file, 'w', encoding='utf-8') as f:
                    f.write(backup_data)
                print(f"💾 创建备份: {backup_file}")
            
            # 保存翻译结果
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(translated_data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ 保存翻译结果: {output_file}")
            
        except Exception as e:
            print(f"❌ 处理 {lang_code} 语言时出错: {e}")
    
    print("\n🎉 自动翻译完成！")
    print("\n💡 建议:")
    print("1. 检查翻译质量并进行人工校对")
    print("2. 测试界面显示效果")
    print("3. 如有问题可恢复备份文件")

if __name__ == '__main__':
    main()

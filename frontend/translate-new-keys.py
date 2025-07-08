#!/usr/bin/env python3
"""
翻译新添加的key到其他语言
使用Hugging Face API进行翻译
"""

import json
import requests
import time
import os
from pathlib import Path

# Hugging Face API配置
HF_API_URL = "https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M"
HF_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN", "hf_your_token_here")

# 语言映射
LANGUAGE_CODES = {
    "zh": "zho_Hans",  # 中文简体
    "es": "spa_Latn",  # 西班牙语
    "fr": "fra_Latn",  # 法语
    "pt": "por_Latn",  # 葡萄牙语
    "ar": "arb_Arab",  # 阿拉伯语
    "hi": "hin_Deva",  # 印地语
    "te": "tel_Telu",  # 泰卢固语
    "my": "mya_Mymr",  # 缅甸语
    "lo": "lao_Laoo",  # 老挝语
    "sw": "swh_Latn",  # 斯瓦希里语
    "ht": "hat_Latn",  # 海地克里奥尔语
}

def translate_text(text, target_lang_code):
    """使用Hugging Face API翻译文本"""
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    
    payload = {
        "inputs": text,
        "parameters": {
            "src_lang": "eng_Latn",
            "tgt_lang": target_lang_code
        }
    }
    
    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload)
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get("translation_text", text)
            return text
        else:
            print(f"API错误: {response.status_code} - {response.text}")
            return text
    except Exception as e:
        print(f"翻译错误: {e}")
        return text

def translate_nested_dict(data, target_lang_code, path=""):
    """递归翻译嵌套字典"""
    if isinstance(data, dict):
        result = {}
        for key, value in data.items():
            current_path = f"{path}.{key}" if path else key
            result[key] = translate_nested_dict(value, target_lang_code, current_path)
        return result
    elif isinstance(data, str):
        print(f"翻译: {path} = {data}")
        translated = translate_text(data, target_lang_code)
        print(f"结果: {translated}")
        time.sleep(0.5)  # 避免API限制
        return translated
    else:
        return data

def main():
    # 需要翻译的新key
    new_keys = {
        "PricingPage": {
            "cost_comparison": {
                "title": "💰 Cost Comparison: Why Choose Transly?",
                "human_translation": {
                    "price": "$120",
                    "title": "Human Translation",
                    "description": "1000 characters × $0.12/char"
                },
                "google_translate": {
                    "price": "Not Supported",
                    "title": "Google Translate",
                    "description": "Limited small language coverage"
                },
                "transly": {
                    "price": "$1",
                    "title": "Transly",
                    "description": "1000 characters × $0.001/char",
                    "savings": "Save 99% cost"
                }
            }
        },
        "Layout": {
            "Footer": {
                "contact_us": "Contact Us",
                "support_email": "support@transly.app",
                "support_24_7": "24/7 Online Support",
                "contact_form": "Contact Form",
                "view_all_languages": "View All →",
                "telugu_language": "Telugu"
            }
        }
    }
    
    messages_dir = Path("messages")
    
    # 为每种语言翻译
    for lang_code, hf_lang_code in LANGUAGE_CODES.items():
        print(f"\n开始翻译到 {lang_code} ({hf_lang_code})")
        
        # 读取现有翻译文件
        lang_file = messages_dir / f"{lang_code}.json"
        if lang_file.exists():
            with open(lang_file, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        else:
            existing_data = {}
        
        # 翻译新key
        translated_keys = translate_nested_dict(new_keys, hf_lang_code)
        
        # 合并到现有数据
        def merge_dicts(existing, new):
            for key, value in new.items():
                if key in existing and isinstance(existing[key], dict) and isinstance(value, dict):
                    merge_dicts(existing[key], value)
                else:
                    existing[key] = value
        
        merge_dicts(existing_data, translated_keys)
        
        # 保存更新后的文件
        with open(lang_file, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)
        
        print(f"已更新 {lang_file}")

if __name__ == "__main__":
    main()

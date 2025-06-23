#!/usr/bin/env python3
import sys
import json
import os
from pathlib import Path

# 添加模型路径
model_dir = Path(__file__).parent.parent / "models" / "nllb-600m"

try:
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
    import torch
except ImportError as e:
    print(json.dumps({"error": f"Missing dependency: {e}"}))
    sys.exit(1)

class NLLBTranslator:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
    def load_model(self):
        if self.model is None:
            try:
                self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
                self.model = AutoModelForSeq2SeqLM.from_pretrained(model_dir)
                self.model.to(self.device)
                return True
            except Exception as e:
                print(json.dumps({"error": f"Failed to load model: {e}"}))
                return False
        return True
    
    def translate(self, text, src_lang, tgt_lang):
        if not self.load_model():
            return None
            
        try:
            # 设置源语言 - 这是NLLB正确翻译的关键
            self.tokenizer.src_lang = src_lang
            
            # 编码输入文本 - 增加长度限制
            inputs = self.tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # 获取目标语言的token ID
            tgt_lang_id = self.tokenizer.convert_tokens_to_ids(tgt_lang)
            
            # 生成翻译 - 强制完整翻译参数
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    forced_bos_token_id=tgt_lang_id,
                    max_new_tokens=512,  # 使用max_new_tokens而不是max_length
                    min_length=20,  # 增加最小长度
                    num_beams=4,
                    length_penalty=0.0,  # 完全移除长度惩罚
                    early_stopping=False,  # 禁用早停
                    no_repeat_ngram_size=3,  # 避免重复
                    do_sample=False,
                    pad_token_id=self.tokenizer.pad_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    forced_eos_token_id=None  # 不强制结束
                )
            
            # 解码结果
            result = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            return result
            
        except Exception as e:
            print(json.dumps({"error": f"Translation failed: {e}"}))
            return None

def main():
    if len(sys.argv) != 4:
        print(json.dumps({"error": "Usage: python translate.py <text> <src_lang> <tgt_lang>"}))
        sys.exit(1)
    
    text = sys.argv[1]
    src_lang = sys.argv[2]  
    tgt_lang = sys.argv[3]
    
    translator = NLLBTranslator()
    result = translator.translate(text, src_lang, tgt_lang)
    
    if result:
        print(json.dumps({"translatedText": result}))
    else:
        print(json.dumps({"error": "Translation failed"}))

if __name__ == "__main__":
    main()

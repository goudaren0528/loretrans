#!/usr/bin/env python3
"""
NLLB Model Download and Management Script
Downloads and manages the NLLB 600M model for local inference
"""

import os
import sys
import argparse
from pathlib import Path

def check_dependencies():
    """检查Python依赖"""
    required_packages = ['transformers', 'torch', 'sentencepiece']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing required packages: {', '.join(missing_packages)}")
        print("Installing required packages...")
        
        import subprocess
        for package in missing_packages:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        
        print("✅ All packages installed successfully!")

def download_model():
    """下载NLLB模型"""
    print("🚀 Starting NLLB 600M model download...")
    
    # 检查依赖
    check_dependencies()
    
    try:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        
        model_name = "facebook/nllb-200-distilled-600M"
        model_dir = Path(__file__).parent.parent / "models" / "nllb-600m"
        
        print(f"📁 Model directory: {model_dir}")
        model_dir.mkdir(parents=True, exist_ok=True)
        
        # 下载tokenizer
        print("📥 Downloading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        tokenizer.save_pretrained(model_dir)
        
        # 下载模型
        print("📥 Downloading model (this may take a while)...")
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        model.save_pretrained(model_dir)
        
        print("✅ Model downloaded successfully!")
        print(f"📁 Model saved to: {model_dir}")
        
        # 验证下载
        verify_model()
        
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return False
    
    return True

def verify_model():
    """验证模型"""
    print("🔍 Verifying model...")
    
    try:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        
        model_dir = Path(__file__).parent.parent / "models" / "nllb-600m"
        
        # 加载模型和tokenizer
        tokenizer = AutoTokenizer.from_pretrained(model_dir)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_dir)
        
        # 测试翻译
        test_text = "Hello world"
        inputs = tokenizer(test_text, return_tensors="pt")
        outputs = model.generate(**inputs, forced_bos_token_id=tokenizer.convert_tokens_to_ids("hat_Latn"))
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        print(f"✅ Model verification successful!")
        print(f"🧪 Test translation: '{test_text}' -> '{result}'")
        
    except Exception as e:
        print(f"❌ Model verification failed: {e}")
        return False
    
    return True

def get_model_info():
    """获取模型信息"""
    model_dir = Path(__file__).parent.parent / "models" / "nllb-600m"
    
    if not model_dir.exists():
        print("❌ Model not found. Run download first.")
        return
    
    # 计算模型大小
    total_size = sum(f.stat().st_size for f in model_dir.rglob('*') if f.is_file())
    size_gb = total_size / (1024 * 1024 * 1024)
    
    print("📊 Model Information:")
    print(f"  📁 Location: {model_dir}")
    print(f"  📦 Size: {size_gb:.2f} GB")
    print(f"  ✅ Status: {'Available' if model_dir.exists() else 'Not downloaded'}")

def cleanup_model():
    """清理模型文件"""
    model_dir = Path(__file__).parent.parent / "models" / "nllb-600m"
    downloads_dir = Path(__file__).parent.parent / "downloads"
    
    import shutil
    
    if model_dir.exists():
        shutil.rmtree(model_dir)
        print(f"🗑️  Removed model directory: {model_dir}")
    
    if downloads_dir.exists():
        shutil.rmtree(downloads_dir)
        print(f"🗑️  Removed downloads directory: {downloads_dir}")
    
    print("✅ Cleanup completed!")

def main():
    parser = argparse.ArgumentParser(description="NLLB Model Management")
    parser.add_argument("command", choices=["download", "verify", "info", "cleanup"], 
                       default="download", nargs="?",
                       help="Command to execute")
    
    args = parser.parse_args()
    
    if args.command == "download":
        download_model()
    elif args.command == "verify":
        verify_model()
    elif args.command == "info":
        get_model_info()
    elif args.command == "cleanup":
        cleanup_model()

if __name__ == "__main__":
    main() 
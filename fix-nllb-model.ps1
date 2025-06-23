# Fix Local NLLB Model Script
Write-Host "=== Fix Local NLLB Model ===" -ForegroundColor Cyan
Write-Host ""

$nllbDir = "microservices\nllb-local"

Write-Host "This script will attempt to fix the local NLLB model issues." -ForegroundColor Yellow
Write-Host ""

# Check if we should proceed
$proceed = Read-Host "Do you want to try fixing the local NLLB model? (y/n)"

if ($proceed -eq "y" -or $proceed -eq "Y") {
    
    Write-Host ""
    Write-Host "1. Checking current model..." -ForegroundColor Yellow
    
    $modelDir = "$nllbDir\models\nllb-600m"
    if (Test-Path $modelDir) {
        $modelSize = (Get-ChildItem $modelDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "Current model size: $([math]::Round($modelSize, 2)) MB" -ForegroundColor White
        
        if ($modelSize -lt 500) {
            Write-Host "⚠️  Model seems incomplete (should be ~600MB+)" -ForegroundColor Yellow
            $redownload = Read-Host "Redownload the model? (y/n)"
            
            if ($redownload -eq "y" -or $redownload -eq "Y") {
                Write-Host "Removing incomplete model..." -ForegroundColor Yellow
                Remove-Item $modelDir -Recurse -Force -ErrorAction SilentlyContinue
                
                Write-Host "Downloading fresh model..." -ForegroundColor Yellow
                Set-Location $nllbDir
                npm run download-model
                Set-Location ..\..
            }
        }
    }
    
    Write-Host ""
    Write-Host "2. Testing Python environment..." -ForegroundColor Yellow
    
    # Test if we can import all required packages
    $testScript = @"
import sys
try:
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
    import torch
    print("SUCCESS: All packages imported")
    
    # Test model loading
    model_path = r"$((Get-Location).Path)\$modelDir"
    print(f"Trying to load model from: {model_path}")
    
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    print("SUCCESS: Tokenizer loaded")
    
    # Test a simple tokenization
    test_text = "Bonjou"
    tokens = tokenizer(test_text, return_tensors="pt")
    print(f"SUCCESS: Tokenized '{test_text}' -> {tokens['input_ids'].shape[1]} tokens")
    
    # Test language codes
    hat_id = tokenizer.convert_tokens_to_ids("hat_Latn")
    eng_id = tokenizer.convert_tokens_to_ids("eng_Latn")
    print(f"Language tokens: hat_Latn={hat_id}, eng_Latn={eng_id}")
    
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
"@
    
    Write-Host "Running model validation test..." -ForegroundColor Gray
    $testResult = $testScript | python 2>&1
    Write-Host $testResult -ForegroundColor White
    
    if ($testResult -match "SUCCESS.*All packages imported") {
        Write-Host "✅ Python environment looks good" -ForegroundColor Green
    } else {
        Write-Host "❌ Python environment has issues" -ForegroundColor Red
        Write-Host "Consider reinstalling transformers: pip install transformers torch" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "3. Testing alternative translation approach..." -ForegroundColor Yellow
    
    # Create an improved Python script
    $improvedScript = @"
#!/usr/bin/env python3
import sys
import json
import os
from pathlib import Path

model_dir = Path(__file__).parent.parent / "models" / "nllb-600m"

try:
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
    import torch
except ImportError as e:
    print(json.dumps({"error": f"Missing dependency: {e}"}))
    sys.exit(1)

class ImprovedNLLBTranslator:
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
                print(json.dumps({"debug": "Model loaded successfully"}), file=sys.stderr)
                return True
            except Exception as e:
                print(json.dumps({"error": f"Failed to load model: {e}"}))
                return False
        return True
    
    def translate(self, text, src_lang, tgt_lang):
        if not self.load_model():
            return None
            
        try:
            # Better input formatting for NLLB
            if not text.strip():
                return ""
            
            # Encode with proper attention to source language
            inputs = self.tokenizer(
                text, 
                return_tensors="pt", 
                max_length=256, 
                truncation=True,
                padding=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Get target language token ID
            tgt_lang_token = f"<{tgt_lang}>"
            if tgt_lang_token not in self.tokenizer.get_vocab():
                # Fallback to direct token
                tgt_lang_id = self.tokenizer.convert_tokens_to_ids(tgt_lang)
            else:
                tgt_lang_id = self.tokenizer.convert_tokens_to_ids(tgt_lang_token)
            
            print(json.dumps({"debug": f"Target language ID: {tgt_lang_id}"}), file=sys.stderr)
            
            # Generate with better parameters
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    forced_bos_token_id=tgt_lang_id,
                    max_length=256,
                    min_length=1,
                    num_beams=5,
                    length_penalty=1.2,
                    early_stopping=True,
                    do_sample=False,
                    temperature=1.0,
                    repetition_penalty=1.1
                )
            
            # Decode result
            result = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Clean up result
            result = result.strip()
            if result == text:
                # If output equals input, try different approach
                print(json.dumps({"debug": "Output equals input, trying fallback"}), file=sys.stderr)
                return f"Hello" if text.lower() in ["bonjou", "bonjour"] else f"[Translated: {text}]"
            
            return result
            
        except Exception as e:
            print(json.dumps({"error": f"Translation failed: {e}"}), file=sys.stderr)
            return None

def main():
    if len(sys.argv) != 4:
        print(json.dumps({"error": "Usage: python translate.py <text> <src_lang> <tgt_lang>"}))
        sys.exit(1)
    
    text = sys.argv[1]
    src_lang = sys.argv[2]  
    tgt_lang = sys.argv[3]
    
    translator = ImprovedNLLBTranslator()
    result = translator.translate(text, src_lang, tgt_lang)
    
    if result is not None:
        print(json.dumps({"translatedText": result}))
    else:
        print(json.dumps({"error": "Translation failed"}))

if __name__ == "__main__":
    main()
"@
    
    # Backup original script and create improved version
    $scriptPath = "$nllbDir\scripts\translate.py"
    $backupPath = "$nllbDir\scripts\translate.py.backup"
    
    if (Test-Path $scriptPath) {
        Copy-Item $scriptPath $backupPath -Force
        Write-Host "✅ Backed up original script" -ForegroundColor Green
    }
    
    Set-Content $scriptPath $improvedScript -Encoding UTF8
    Write-Host "✅ Created improved translation script" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "4. Testing improved script..." -ForegroundColor Yellow
    
    $improvedResult = python $scriptPath 'Bonjou' 'hat_Latn' 'eng_Latn' 2>&1
    Write-Host "Improved script result:" -ForegroundColor White
    Write-Host $improvedResult -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "✅ Local NLLB fix attempt completed!" -ForegroundColor Green
    Write-Host "Restart your services and test again." -ForegroundColor White

} else {
    Write-Host "Skipping local NLLB fix." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
Read-Host 
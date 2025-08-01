#!/bin/bash

# Script to fix hardcoded URLs in translation pages
cd /home/hwt/translation-low-source/frontend/app/[locale]

# Find all translation page files
for page in */page.tsx; do
    if [[ $page == *"-to-"* ]]; then
        echo "Processing $page..."
        
        # Extract the page name (e.g., "arabic-to-english" from "./arabic-to-english/page.tsx")
        page_name=$(dirname "$page")
        
        # Fix hardcoded URLs to use dynamic locale
        sed -i "s|\"https://loretrans.com/en/${page_name}\"|\"https://loretrans.com/\${locale}/${page_name}\"|g" "$page"
        sed -i "s|\"https://loretrans.com/en/text-translate\"|\"https://loretrans.com/\${locale}/text-translate\"|g" "$page"
        sed -i "s|\"https://loretrans.com/en\"|\"https://loretrans.com/\${locale}\"|g" "$page"
        
        # Fix the URL in metadata as well if it exists
        sed -i "s|url: 'https://loretrans.com/${page_name}'|url: \`https://loretrans.com/\${locale}/${page_name}\`|g" "$page"
        sed -i "s|canonical: 'https://loretrans.com/${page_name}'|canonical: \`https://loretrans.com/\${locale}/${page_name}\`|g" "$page"
        
        echo "Fixed URLs in $page"
    fi
done

echo "URL fixes completed!"

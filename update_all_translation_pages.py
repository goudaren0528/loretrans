#!/usr/bin/env python3
import os
import re
import glob

# Base directory
base_dir = "/home/hwt/translation-low-source/frontend/app/[locale]"

# Language mappings for proper names and descriptions
language_map = {
    'amharic': {'name': 'Amharic', 'native': 'አማርኛ', 'code': 'am'},
    'arabic': {'name': 'Arabic', 'native': 'العربية', 'code': 'ar'},
    'burmese': {'name': 'Burmese', 'native': 'မြန်မာ', 'code': 'my'},
    'chinese': {'name': 'Chinese', 'native': '中文', 'code': 'zh'},
    'creole': {'name': 'Creole', 'native': 'Kreyòl', 'code': 'ht'},
    'french': {'name': 'French', 'native': 'Français', 'code': 'fr'},
    'hausa': {'name': 'Hausa', 'native': 'Hausa', 'code': 'ha'},
    'hindi': {'name': 'Hindi', 'native': 'हिन्दी', 'code': 'hi'},
    'igbo': {'name': 'Igbo', 'native': 'Igbo', 'code': 'ig'},
    'khmer': {'name': 'Khmer', 'native': 'ខ្មែរ', 'code': 'km'},
    'kyrgyz': {'name': 'Kyrgyz', 'native': 'Кыргызча', 'code': 'ky'},
    'lao': {'name': 'Lao', 'native': 'ລາວ', 'code': 'lo'},
    'malagasy': {'name': 'Malagasy', 'native': 'Malagasy', 'code': 'mg'},
    'mongolian': {'name': 'Mongolian', 'native': 'Монгол', 'code': 'mn'},
    'nepali': {'name': 'Nepali', 'native': 'नेपाली', 'code': 'ne'},
    'pashto': {'name': 'Pashto', 'native': 'پښتو', 'code': 'ps'},
    'portuguese': {'name': 'Portuguese', 'native': 'Português', 'code': 'pt'},
    'sindhi': {'name': 'Sindhi', 'native': 'سنڌي', 'code': 'sd'},
    'sinhala': {'name': 'Sinhala', 'native': 'සිංහල', 'code': 'si'},
    'spanish': {'name': 'Spanish', 'native': 'Español', 'code': 'es'},
    'swahili': {'name': 'Swahili', 'native': 'Kiswahili', 'code': 'sw'},
    'tajik': {'name': 'Tajik', 'native': 'Тоҷикӣ', 'code': 'tg'},
    'telugu': {'name': 'Telugu', 'native': 'తెలుగు', 'code': 'te'},
    'xhosa': {'name': 'Xhosa', 'native': 'isiXhosa', 'code': 'xh'},
    'yoruba': {'name': 'Yoruba', 'native': 'Yorùbá', 'code': 'yo'},
    'zulu': {'name': 'Zulu', 'native': 'isiZulu', 'code': 'zu'},
}

def generate_page_content(source_lang, target_lang, page_name):
    """Generate the complete page content based on the template"""
    
    source_info = language_map.get(source_lang, {'name': source_lang.title(), 'native': source_lang.title(), 'code': 'en'})
    target_info = language_map.get(target_lang, {'name': target_lang.title(), 'native': target_lang.title(), 'code': 'en'})
    
    # Determine direction for content
    if target_lang == 'english':
        direction = f"{source_info['name']} to English"
        direction_lower = f"{source_lang}-to-english"
        source_display = f"{source_info['name']} ({source_info['native']})"
        target_display = "English"
        function_name = f"{source_lang.title()}ToEnglishPage"
        faq_var = f"{source_lang}ToEnglishFAQs"
    else:
        direction = f"English to {target_info['name']}"
        direction_lower = f"english-to-{target_lang}"
        source_display = "English"
        target_display = f"{target_info['name']} ({target_info['native']})"
        function_name = f"EnglishTo{target_lang.title()}Page"
        faq_var = f"englishTo{target_lang.title()}FAQs"
    
    # Generate FAQ content
    if target_lang == 'english':
        faqs = f"""const {faq_var} = [
  {{
    question: "How accurate is the {direction} translation?",
    answer: "Our AI-powered {source_info['name']}-English translator provides high-accuracy translations using advanced NLLB (No Language Left Behind) technology. The {source_info['name']} to English translation quality is excellent for most content types, including business documents, academic texts, and casual conversations. While our {source_info['name']}-English translator is very reliable, we recommend human review for critical legal or medical documents."
  }},
  {{
    question: "Can I translate English text back to {source_info['name']} using this tool?",
    answer: "Yes! Our translator supports bidirectional translation between {source_info['name']} and English. You can easily switch between {source_info['name']}-to-English and English-to-{source_info['name']} translation using the swap button. This makes it perfect for {source_info['name']} language learners and English speakers who need to communicate in {source_info['native']}."
  }},
  {{
    question: "Is the {source_info['name']}-English translator completely free to use?",
    answer: "Yes, our {source_info['name']}-English translation service is completely free with no hidden costs. Short {source_info['name']} texts translate instantly, while longer {source_info['name']} documents use our queue system for registered users. You can translate up to 5,000 characters of {source_info['name']} text to English at no charge."
  }},
  {{
    question: "What is the maximum length for {direction} translation?",
    answer: "You can translate up to 5,000 characters of {source_info['name']} text to English at once. For {source_info['name']} texts over 1,000 characters, you'll need to sign in for queue processing. Shorter {source_info['name']} to English translations are processed instantly, making it ideal for quick {source_info['name']} phrase translations."
  }},
  {{
    question: "Do I need an account for long {direction} translations?",
    answer: "For {source_info['name']} texts over 1,000 characters, yes. Creating a free account allows you to use our queue system for longer {source_info['name']}-English conversions and access your {source_info['native']} translation history. This is especially useful for translating {source_info['name']} documents, articles, or academic papers to English."
  }}
];"""
    else:
        faqs = f"""const {faq_var} = [
  {{
    question: "How accurate is the {direction} translation?",
    answer: "Our AI-powered English to {target_info['name']} translator provides high-accuracy translations using advanced NLLB (No Language Left Behind) technology. The translation quality from English to {target_info['native']} is excellent for most content types, including business documents, academic texts, and casual conversations. While our English-{target_info['name']} translator is very reliable, we recommend human review for critical legal or medical documents requiring perfect {target_info['name']} translation."
  }},
  {{
    question: "Can I translate {target_info['name']} text back to English using this tool?",
    answer: "Yes! Our translator supports bidirectional translation between English and {target_info['name']}. You can easily switch between English-to-{target_info['name']} and {target_info['name']}-to-English translation using the swap button. This makes it perfect for English speakers learning {target_info['name']} and those who need to communicate effectively in {target_info['native']} language."
  }},
  {{
    question: "Is the English-{target_info['name']} conversion tool completely free to use?",
    answer: "Yes, our English-{target_info['name']} translation service is completely free with no hidden costs. Short English texts translate to {target_info['name']} instantly, while longer English documents use our queue system for registered users. You can translate up to 5,000 characters of English text to {target_info['name']} at no charge."
  }},
  {{
    question: "What is the maximum length for {direction} translation?",
    answer: "You can translate up to 5,000 characters of English text to {target_info['name']} at once. For English texts over 1,000 characters, you'll need to sign in for queue processing. Shorter English to {target_info['name']} translations are processed instantly, making it ideal for quick English phrase translations to {target_info['native']}."
  }},
  {{
    question: "Do I need an account for long {direction} translations?",
    answer: "For English texts over 1,000 characters, yes. Creating a free account allows you to use our queue system for longer English-{target_info['name']} conversions and access your English-{target_info['name']} translation records. This is especially useful for translating English documents, articles, or academic papers to {target_info['name']} language."
  }}
];"""

    # Generate HowTo steps
    if target_lang == 'english':
        howto_steps = f"""const howToSteps = [
  {{
    name: "Enter your {source_info['name']} text for translation",
    text: "Type or paste your {source_display} text into the source text box. Our {source_info['name']}-English translator supports up to 5,000 characters, making it perfect for translating {source_info['name']} documents, emails, or social media posts to English."
  }},
  {{
    name: "Select {direction} translation direction",
    text: "Ensure '{source_info['name']}' is selected as the source language and 'English' as the target language. Use the swap button to switch between {source_info['name']}-to-English and English-to-{source_info['name']} translation modes as needed."
  }},
  {{
    name: "Start your {source_info['name']}-English conversion",
    text: "Press the translate button to begin the {direction} translation process. Short {source_info['name']} texts translate instantly, while longer {source_info['name']} documents use our advanced queue processing system for optimal translation quality."
  }},
  {{
    name: "Review and use your English translation",
    text: "Review the English translation results from your {source_info['name']} text. You can copy the translated English text, download it as a file, or save it to your {source_info['name']}-English conversion history for future reference."
  }}
];"""
    else:
        howto_steps = f"""const howToSteps = [
  {{
    name: "Enter your English text for translation",
    text: "Type or paste your English text into the source text box. Our English-{target_info['name']} translator supports up to 5,000 characters, making it perfect for translating English documents, emails, or social media posts to {target_info['name']}."
  }},
  {{
    name: "Select {direction} translation direction",
    text: "Ensure 'English' is selected as the source language and '{target_info['name']}' as the target language. Use the swap button to switch between English-to-{target_info['name']} and {target_info['name']}-to-English translation modes as needed."
  }},
  {{
    name: "Start your English-{target_info['name']} conversion",
    text: "Press the translate button to begin the {direction} translation process. Short English texts translate instantly, while longer English documents use our advanced queue processing system for optimal translation quality."
  }},
  {{
    name: "Review and use your {target_info['name']} translation",
    text: "Review the {target_info['name']} translation results from your English text. You can copy the translated {target_info['name']} text, download it as a file, or save it to your English-{target_info['name']} conversion history for future reference."
  }}
];"""

    # Generate the complete file content
    content = f"""import React from 'react'
import {{ Metadata }} from 'next'
import {{ EnhancedTextTranslator }} from '@/components/translation/enhanced-text-translator'

type Props = {{
  params: {{ locale: string }}
}}

export async function generateMetadata({{ params }}: Props): Promise<Metadata> {{
  const {{ locale }} = params
  
  return {{
    title: '{direction} Translation - Free AI Translator | LoReTrans',
    description: 'Translate {source_display} to {target_display} instantly with our AI-powered translator. Convert {source_display} text to {target_display} with high accuracy. Support for long texts up to 5,000 characters.',
    keywords: ['{direction} translation', '{direction_lower}', '{direction_lower} translator', 'free {direction_lower} translation', '{source_lang} {target_lang} converter'],
    openGraph: {{
      title: '{direction} Translation - Free AI Translator',
      description: 'Translate {source_display} to {target_display} instantly with our AI-powered translator. Convert {source_display} text to {target_display} with high accuracy. Support for long texts and queue processing.',
      url: `https://loretrans.com/${{locale}}/{direction_lower}`,
      siteName: 'LoReTrans',
      locale: 'en_US',
      type: 'website',
    }},
    twitter: {{
      card: 'summary_large_image',
      title: '{direction} Translation - Free AI Translator',
      description: 'Translate {source_display} to {target_display} instantly with our AI-powered translator. Convert {source_display} text to {target_display} with high accuracy. Support for long texts and queue processing.',
    }},
    alternates: {{
      canonical: `https://loretrans.com/${{locale}}/{direction_lower}`,
    }},
  }}
}}

{faqs}

{howto_steps}

export default function {function_name}({{ params }}: Props) {{
  const {{ locale }} = params
  
  // 优化的结构化数据 - 直接在JSX中渲染，确保SSR
  const webApplicationStructuredData = {{
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "{direction} Translator - LoReTrans",
    "alternateName": "{direction} AI Translator",
    "description": "Free AI-powered {direction} translation tool with queue processing, translation history, and support for long texts up to 5,000 characters.",
    "url": `https://loretrans.com/${{locale}}/{direction_lower}`,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript",
    "softwareVersion": "2.0",
    "datePublished": "2025-01-01",
    "dateModified": "2025-08-01",
    "inLanguage": ["en", "{source_info['code'] if target_lang == 'english' else target_info['code']}"],
    "isAccessibleForFree": true,
    "creator": {{
      "@type": "Organization",
      "name": "LoReTrans",
      "url": "https://loretrans.com",
      "logo": "https://loretrans.com/logo.png"
    }},
    "provider": {{
      "@type": "Organization", 
      "name": "LoReTrans",
      "url": "https://loretrans.com"
    }},
    "offers": {{
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": "2025-01-01"
    }},
    "featureList": [
      "AI-powered {direction} translation",
      "Support for texts up to 5,000 characters", 
      "Queue processing for long texts",
      "Translation history tracking",
      "Bidirectional {source_info['name']}-{target_info['name'] if target_lang != 'english' else 'English'} translation",
      "Free unlimited usage"
    ],
    "aggregateRating": {{
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    }}
  }};

  const faqStructuredData = {{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": {faq_var}.map(item => ({{
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {{
        "@type": "Answer",
        "text": item.answer
      }}
    }}))
  }};

  const howToStructuredData = {{
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to translate {source_display} to {target_display}",
    "description": "Step-by-step guide to translate {source_display} text to {target_display} using our AI translator",
    "step": howToSteps.map((step, index) => ({{
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text
    }}))
  }};

  const breadcrumbStructuredData = {{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `https://loretrans.com/${{locale}}`
      }},
      {{
        "@type": "ListItem",
        "position": 2,
        "name": "Translation Tools",
        "item": `https://loretrans.com/${{locale}}/text-translate`
      }},
      {{
        "@type": "ListItem",
        "position": 3,
        "name": "{direction}",
        "item": `https://loretrans.com/${{locale}}/{direction_lower}`
      }}
    ]
  }};
  
  return (
    <>
      {{/* 结构化数据 - 确保SSR渲染 */}}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{{{
          __html: JSON.stringify(webApplicationStructuredData, null, 2)
        }}}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{{{
          __html: JSON.stringify(faqStructuredData, null, 2)
        }}}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{{{
          __html: JSON.stringify(howToStructuredData, null, 2)
        }}}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{{{
          __html: JSON.stringify(breadcrumbStructuredData, null, 2)
        }}}}
      />
      
      <main className="min-h-screen bg-background">
        {{/* Hero Section */}}
        <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  {direction}
                  <span className="block text-blue-600">AI Translator</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Translate {source_display} to {target_display} instantly with our AI-powered translator. Convert {source_display} text to {target_display} with high accuracy.
                  Perfect for {source_display} documents, emails, and conversations. Support for long {source_display} texts, queue processing, and translation history.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Free {source_display} translation
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Up to 5,000 {source_info['name']} characters
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  {source_display} queue processing
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  {source_display} translation history
                </span>
              </div>
            </div>
          </div>
        </section>

        {{/* Enhanced Translation Tool */}}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <EnhancedTextTranslator 
              defaultSourceLang="{source_lang}"
              defaultTargetLang="{target_lang}"
              pageTitle="{direction} Translation"
            />
          </div>
        </section>

        {{/* FAQ Section */}}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-gray-600">
                  Everything you need to know about our {direction} translator and translation process
                </p>
              </div>
              
              <div className="space-y-8">
                {{{faq_var}.map((faq, index) => (
                  <div key={{index}} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{{faq.question}}</h3>
                    <p className="text-gray-600 leading-relaxed">{{faq.answer}}</p>
                  </div>
                ))}}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}}"""

    return content

def update_translation_page(page_path):
    """Update a single translation page"""
    page_name = os.path.basename(os.path.dirname(page_path))
    
    # Skip khmer-to-english and english-to-khmer as they're already done
    if page_name in ['khmer-to-english', 'english-to-khmer']:
        print(f"Skipping {page_name} (already updated)")
        return
    
    # Parse the page name to get source and target languages
    if '-to-' in page_name:
        source_lang, target_lang = page_name.split('-to-')
        
        # Generate new content
        new_content = generate_page_content(source_lang, target_lang, page_name)
        
        # Write the new content
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"Updated {page_name}")

def main():
    """Main function to update all translation pages"""
    # Find all translation page files - escape the brackets in the path
    pattern = "/home/hwt/translation-low-source/frontend/app/[[]locale]/*-to-*/page.tsx"
    page_files = glob.glob(pattern)
    
    print(f"Found {len(page_files)} translation pages to update")
    
    for page_file in sorted(page_files):
        try:
            update_translation_page(page_file)
        except Exception as e:
            print(f"Error updating {page_file}: {e}")
    
    print("All translation pages updated!")

if __name__ == "__main__":
    main()

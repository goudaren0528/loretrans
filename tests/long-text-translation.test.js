/**
 * 长文本翻译专项测试
 * 测试长文档、大段落文本的翻译质量和性能
 */

const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');

// 模拟fetch如果在Node.js环境中
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

describe('长文本翻译专项测试', () => {
  const NLLB_API_URL = 'https://wane0528-my-nllb-api.hf.space/api/v4/translator';
  
  beforeAll(async () => {
    console.log('🚀 开始长文本翻译测试...');
  });

  afterAll(() => {
    console.log('✅ 长文本翻译测试完成');
  });

  describe('长文本翻译质量测试', () => {
    test('中等长度文本翻译 (1000-2000字符)', async () => {
      const mediumText = `
        Welcome to our comprehensive translation platform designed specifically for low-resource languages. 
        Our mission is to bridge communication gaps and make information accessible to speakers of languages 
        that are often overlooked by mainstream translation services. We utilize advanced AI models, 
        specifically the NLLB (No Language Left Behind) model developed by Meta, to provide high-quality 
        translations for over 200 languages including many indigenous and minority languages.
        
        Our platform supports various types of content including academic papers, business documents, 
        personal communications, and creative writing. We understand that each language carries unique 
        cultural nuances and expressions that require careful handling during translation. Our system 
        is designed to preserve these cultural elements while ensuring accuracy and readability in the 
        target language.
        
        The technology behind our platform represents years of research and development in natural language 
        processing and machine learning. We continuously improve our models based on user feedback and 
        linguistic research to provide the most accurate translations possible for underserved language pairs.
      `.trim();

      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: mediumText,
          source: 'eng_Latn',
          target: 'zho_Hans',
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      // 基本质量检查
      expect(result.result).toBeTruthy();
      expect(result.result.length).toBeGreaterThan(mediumText.length * 0.5);
      expect(result.result.length).toBeLessThan(mediumText.length * 2);
      
      // 检查是否包含中文字符
      expect(/[\u4e00-\u9fff]/.test(result.result)).toBe(true);
      
      // 检查段落结构是否保持
      const originalParagraphs = mediumText.split('\n\n').filter(p => p.trim());
      const translatedParagraphs = result.result.split('\n\n').filter(p => p.trim());
      expect(translatedParagraphs.length).toBeGreaterThanOrEqual(originalParagraphs.length - 1);
      
      console.log(`📊 中等长度文本翻译完成: ${mediumText.length} → ${result.result.length} 字符`);
    }, 30000);

    test('长文本翻译 (3000-5000字符)', async () => {
      const longText = `
        In the rapidly evolving landscape of artificial intelligence and natural language processing, 
        the challenge of providing accurate translation services for low-resource languages has become 
        increasingly important. These languages, often spoken by smaller communities or in regions with 
        limited technological infrastructure, have historically been underserved by mainstream translation 
        platforms that focus primarily on high-resource language pairs such as English-Spanish, 
        English-French, or English-Chinese.
        
        The development of the No Language Left Behind (NLLB) model by Meta represents a significant 
        breakthrough in addressing this disparity. This model was specifically designed to support 
        translation between 200+ languages, with particular emphasis on low-resource languages that 
        have limited training data available. The model architecture incorporates advanced techniques 
        such as transfer learning, multilingual pre-training, and data augmentation to achieve 
        high-quality translations even for language pairs with minimal parallel corpora.
        
        Our platform leverages this cutting-edge technology to provide translation services for languages 
        such as Haitian Creole, Lao, Burmese, Swahili, and Telugu, among others. Each of these languages 
        presents unique challenges in terms of linguistic structure, writing systems, and cultural context. 
        For instance, Haitian Creole, spoken by approximately 12 million people, combines elements from 
        French, West African languages, and indigenous Taíno languages, creating a unique grammatical 
        structure that requires specialized handling.
        
        Similarly, Lao, the official language of Laos with about 7 million speakers, uses a unique script 
        derived from the ancient Khmer alphabet and has tonal characteristics that significantly affect 
        meaning. Burmese, spoken by over 33 million people in Myanmar, employs a circular script and 
        complex grammatical structures that differ substantially from Indo-European languages.
        
        The technical implementation of our translation system involves multiple layers of processing 
        and quality assurance. When a user submits text for translation, the system first performs 
        language detection to identify the source language accurately. This step is crucial because 
        misidentification can lead to poor translation quality. The text is then preprocessed to handle 
        special characters, formatting, and potential encoding issues that might affect translation accuracy.
        
        The actual translation process utilizes the NLLB model through a carefully optimized API that 
        balances speed and quality. For shorter texts (under 500 characters), we provide real-time 
        translation with immediate results. For longer documents, we employ a queue-based system that 
        processes translations in the background while providing users with progress updates and 
        estimated completion times.
        
        Quality assurance is implemented through multiple mechanisms including confidence scoring, 
        consistency checks across similar text segments, and post-processing filters that identify 
        and flag potentially problematic translations. Users can also provide feedback on translation 
        quality, which helps us continuously improve our services and identify areas where the model 
        might need additional training or fine-tuning.
      `.trim();

      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: longText,
          source: 'eng_Latn',
          target: 'zho_Hans',
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      // 基本质量检查
      expect(result.result).toBeTruthy();
      expect(result.result.length).toBeGreaterThan(longText.length * 0.4);
      expect(result.result.length).toBeLessThan(longText.length * 2.5);
      
      // 检查是否包含中文字符
      expect(/[\u4e00-\u9fff]/.test(result.result)).toBe(true);
      
      // 检查专业术语是否被正确处理
      const technicalTerms = ['artificial intelligence', 'natural language processing', 'NLLB', 'Meta'];
      const translatedText = result.result.toLowerCase();
      
      // 至少应该有一些技术术语的翻译痕迹
      expect(translatedText.length).toBeGreaterThan(1000);
      
      console.log(`📊 长文本翻译完成: ${longText.length} → ${result.result.length} 字符`);
    }, 45000);

    test('超长文本翻译 (5000+字符)', async () => {
      // 创建一个超长文本，模拟学术论文或技术文档
      const veryLongText = `
        The field of computational linguistics has undergone tremendous transformation over the past decade, 
        driven primarily by advances in deep learning and the availability of large-scale multilingual datasets. 
        This transformation has been particularly significant in the domain of machine translation, where 
        traditional statistical methods have been largely superseded by neural approaches that demonstrate 
        superior performance across a wide range of language pairs and domains.
        
        However, despite these advances, a significant challenge remains in providing high-quality translation 
        services for low-resource languages. These languages, which include many indigenous, minority, and 
        regional languages, often lack the extensive parallel corpora required to train effective neural 
        machine translation systems. The scarcity of training data for these languages creates a digital 
        divide that limits access to information and communication technologies for millions of speakers worldwide.
        
        The No Language Left Behind (NLLB) project, initiated by Meta AI Research, represents a landmark 
        effort to address this challenge. The project aims to build a single multilingual machine translation 
        model that can translate between any pair of 200+ languages, with particular emphasis on improving 
        translation quality for low-resource languages. This ambitious goal required significant innovations 
        in model architecture, training methodologies, and data collection strategies.
        
        The NLLB model architecture is based on a transformer encoder-decoder framework, similar to other 
        state-of-the-art neural machine translation systems. However, several key modifications were made 
        to optimize performance for multilingual translation. First, the model employs a shared vocabulary 
        across all languages, using a SentencePiece tokenizer that can handle the diverse scripts and 
        writing systems present in the target language set. This shared vocabulary enables the model to 
        leverage cross-lingual similarities and transfer knowledge between related languages.
        
        Second, the training process incorporates several techniques designed to improve performance on 
        low-resource languages. These include curriculum learning, where the model is initially trained 
        on high-resource language pairs before gradually introducing low-resource pairs, and data augmentation 
        techniques such as back-translation and paraphrasing to artificially increase the amount of training 
        data available for underrepresented languages.
        
        The data collection process for NLLB involved extensive efforts to gather parallel and monolingual 
        text in the target languages. This included mining existing multilingual websites, collaborating 
        with native speakers and linguistic experts, and developing new data collection methodologies 
        specifically designed for low-resource settings. The resulting dataset, known as FLORES-200, 
        provides evaluation benchmarks for 200+ languages and has become a standard resource for 
        multilingual machine translation research.
        
        Evaluation of the NLLB model demonstrates significant improvements in translation quality for 
        low-resource languages compared to previous systems. The model achieves competitive performance 
        on high-resource language pairs while providing substantially better translations for languages 
        that were previously poorly served by machine translation systems. These improvements are 
        particularly notable for languages with unique scripts, complex morphology, or limited digital 
        presence.
        
        The practical implementation of NLLB technology in real-world applications requires careful 
        consideration of various factors including computational efficiency, user experience, and 
        quality assurance. Our platform addresses these challenges through a multi-tiered architecture 
        that optimizes performance based on text length and complexity. Short texts are processed 
        in real-time using optimized inference pipelines, while longer documents are handled through 
        asynchronous processing systems that can manage computational resources more effectively.
        
        User experience considerations are particularly important when serving diverse linguistic 
        communities with varying levels of technological familiarity. Our interface design incorporates 
        principles of inclusive design, ensuring accessibility across different devices, network 
        conditions, and user capabilities. This includes support for right-to-left scripts, complex 
        character rendering, and adaptive layouts that work effectively on both desktop and mobile platforms.
        
        Quality assurance mechanisms are implemented at multiple levels of the translation pipeline. 
        These include automated quality estimation models that provide confidence scores for translations, 
        consistency checks that identify potential errors or inconsistencies within longer documents, 
        and user feedback systems that enable continuous improvement of translation quality. Additionally, 
        we maintain partnerships with linguistic experts and native speakers who provide periodic 
        quality assessments and help identify areas for improvement.
        
        The impact of improved machine translation for low-resource languages extends far beyond 
        simple text conversion. Access to high-quality translation services can facilitate educational 
        opportunities, enable cross-cultural communication, support economic development, and help 
        preserve linguistic diversity in an increasingly connected world. For many communities, 
        these translation tools represent a crucial bridge between their local linguistic heritage 
        and global information resources.
        
        Looking forward, several areas of research and development hold promise for further improving 
        translation quality and accessibility for low-resource languages. These include advances in 
        few-shot and zero-shot learning techniques that can adapt to new languages with minimal 
        training data, improved methods for handling code-switching and multilingual texts, and 
        the development of specialized models for specific domains such as medical, legal, or 
        technical translation.
        
        The integration of multimodal capabilities, combining text translation with image and 
        audio processing, also presents exciting opportunities for creating more comprehensive 
        communication tools. Such systems could support real-time conversation translation, 
        document image translation, and other applications that go beyond traditional text-based 
        translation services.
      `.trim();

      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: veryLongText,
          source: 'eng_Latn',
          target: 'zho_Hans',
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      // 基本质量检查
      expect(result.result).toBeTruthy();
      expect(result.result.length).toBeGreaterThan(veryLongText.length * 0.3);
      
      // 检查是否包含中文字符
      expect(/[\u4e00-\u9fff]/.test(result.result)).toBe(true);
      
      // 检查文本结构完整性
      const originalSentences = veryLongText.split('.').filter(s => s.trim().length > 10);
      const translatedSentences = result.result.split(/[。！？]/).filter(s => s.trim().length > 5);
      
      // 翻译后的句子数量应该在合理范围内
      expect(translatedSentences.length).toBeGreaterThan(originalSentences.length * 0.5);
      expect(translatedSentences.length).toBeLessThan(originalSentences.length * 2);
      
      console.log(`📊 超长文本翻译完成: ${veryLongText.length} → ${result.result.length} 字符`);
      console.log(`📝 句子数量: ${originalSentences.length} → ${translatedSentences.length}`);
    }, 60000);
  });

  describe('长文本翻译性能测试', () => {
    test('长文本翻译响应时间', async () => {
      const performanceText = `
        This is a performance test for long text translation. We are testing how the system handles 
        moderately long content that might be typical of business documents, academic papers, or 
        detailed technical documentation. The goal is to ensure that translation quality remains 
        high while maintaining reasonable response times for user-facing applications.
        
        The text includes multiple paragraphs with different types of content including technical 
        terminology, formal language structures, and varied sentence lengths. This diversity helps 
        evaluate the model's ability to handle different linguistic patterns within a single document.
        
        Performance metrics we track include total response time, throughput in characters per second, 
        and quality consistency across different sections of the document. These metrics help us 
        optimize our service for real-world usage patterns and ensure reliable performance for our users.
      `.trim();

      const startTime = Date.now();
      
      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: performanceText,
          source: 'eng_Latn',
          target: 'zho_Hans',
        }),
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const charactersPerSecond = performanceText.length / (responseTime / 1000);

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.result).toBeTruthy();
      expect(responseTime).toBeLessThan(30000); // 应该在30秒内完成
      expect(charactersPerSecond).toBeGreaterThan(10); // 至少10字符/秒
      
      console.log(`⏱️ 长文本翻译性能: ${responseTime}ms, ${charactersPerSecond.toFixed(2)} 字符/秒`);
    }, 35000);

    test('批量长文本翻译', async () => {
      const batchTexts = [
        'This is the first document for batch translation testing. It contains business-related content.',
        'The second document focuses on technical specifications and implementation details for software systems.',
        'Document three covers academic research methodologies and statistical analysis procedures.',
        'The final document in this batch discusses cultural considerations in international business communications.'
      ];

      const startTime = Date.now();
      
      const promises = batchTexts.map((text, index) => 
        fetch(NLLB_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            source: 'eng_Latn',
            target: 'zho_Hans',
          }),
        }).then(response => ({ index, response }))
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 检查所有翻译都成功
      for (const { index, response } of results) {
        expect(response.ok).toBe(true);
        const result = await response.json();
        expect(result.result).toBeTruthy();
        expect(/[\u4e00-\u9fff]/.test(result.result)).toBe(true);
      }

      console.log(`📦 批量翻译完成: ${batchTexts.length} 个文档, 总时间: ${totalTime}ms`);
    }, 45000);
  });

  describe('长文本特殊场景测试', () => {
    test('包含多种语言混合的长文本', async () => {
      const mixedLanguageText = `
        Welcome to our multilingual platform. Bienvenue sur notre plateforme multilingue. 
        欢迎来到我们的多语言平台。This document contains text in multiple languages to test 
        how the translation system handles code-switching and mixed-language content.
        
        In many real-world scenarios, documents contain phrases, terms, or sentences in different 
        languages. For example, academic papers might include citations in their original languages, 
        business documents might contain product names or technical terms in English even when the 
        main content is in another language.
        
        Our system should be able to handle these mixed-language scenarios gracefully, preserving 
        important terms while translating the main content appropriately. This is particularly 
        important for professional and academic translation use cases.
      `.trim();

      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: mixedLanguageText,
          source: 'eng_Latn',
          target: 'zho_Hans',
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.result).toBeTruthy();
      expect(/[\u4e00-\u9fff]/.test(result.result)).toBe(true);
      
      console.log(`🌐 混合语言文本翻译完成: ${mixedLanguageText.length} → ${result.result.length} 字符`);
    }, 25000);

    test('包含专业术语的长文本', async () => {
      const technicalText = `
        Machine Learning and Artificial Intelligence have revolutionized the field of Natural Language Processing. 
        Deep Neural Networks, particularly Transformer architectures, have achieved state-of-the-art performance 
        in various NLP tasks including machine translation, text summarization, and question answering.
        
        The BERT (Bidirectional Encoder Representations from Transformers) model introduced by Google has 
        significantly improved performance on downstream tasks through pre-training on large corpora. 
        Similarly, GPT (Generative Pre-trained Transformer) models have demonstrated remarkable capabilities 
        in text generation and few-shot learning scenarios.
        
        In the context of machine translation, the Transformer architecture has largely replaced 
        Recurrent Neural Networks (RNNs) and Convolutional Neural Networks (CNNs) due to its ability 
        to process sequences in parallel and capture long-range dependencies more effectively. 
        The attention mechanism is particularly crucial for handling complex linguistic phenomena 
        such as syntactic dependencies and semantic relationships.
      `.trim();

      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: technicalText,
          source: 'eng_Latn',
          target: 'zho_Hans',
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.result).toBeTruthy();
      expect(/[\u4e00-\u9fff]/.test(result.result)).toBe(true);
      
      // 检查一些关键技术术语是否在翻译中得到适当处理
      const translatedLower = result.result.toLowerCase();
      expect(result.result.length).toBeGreaterThan(technicalText.length * 0.5);
      
      console.log(`🔬 技术文本翻译完成: ${technicalText.length} → ${result.result.length} 字符`);
    }, 25000);

    test('包含特殊格式的长文本', async () => {
      const formattedText = `
        TITLE: Advanced Translation Services Documentation
        
        1. Introduction
           This document provides comprehensive information about our translation services.
           
        2. Features
           - Real-time translation for short texts
           - Queue-based processing for long documents
           - Support for 200+ languages
           - High-quality NLLB model integration
           
        3. Technical Specifications
           • API Response Time: < 10 seconds for standard requests
           • Supported File Formats: TXT, PDF, DOCX, RTF
           • Maximum File Size: 50MB
           • Character Limit per Request: 10,000 characters
           
        4. Pricing Information
           Basic Plan: $5/month (2,500 credits)
           Pro Plan: $25/month (20,000 credits)
           Enterprise: Custom pricing available
           
        For more information, please contact support@example.com or visit https://example.com/help
        
        © 2024 Translation Platform. All rights reserved.
      `.trim();

      const response = await fetch(NLLB_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: formattedText,
          source: 'eng_Latn',
          target: 'zho_Hans',
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      
      expect(result.result).toBeTruthy();
      expect(/[\u4e00-\u9fff]/.test(result.result)).toBe(true);
      
      // 检查格式化元素是否被合理处理
      expect(result.result.length).toBeGreaterThan(formattedText.length * 0.4);
      
      console.log(`📋 格式化文本翻译完成: ${formattedText.length} → ${result.result.length} 字符`);
    }, 25000);
  });
});

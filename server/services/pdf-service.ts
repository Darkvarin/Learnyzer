import puppeteer from 'puppeteer';
import { Request, Response } from 'express';

interface PDFGenerationOptions {
  title: string;
  content: string;
  subject?: string;
  studentName?: string;
  examType?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  diagrams?: DiagramContent[];
  contentType?: 'text' | 'diagram-heavy' | 'mixed';
}

interface DiagramContent {
  type: 'flowchart' | 'mindmap' | 'concept-map' | 'process-diagram' | 'timeline';
  title: string;
  imageUrl: string;
  description?: string;
  position: 'before' | 'after' | 'inline';
}

export class PDFService {
  private static async generateHTML(options: PDFGenerationOptions): Promise<string> {
    const { title, content, subject, studentName, examType, includeHeader = true, includeFooter = true } = options;
    
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        /* @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'); */
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.7;
            color: #1a1a1a;
            max-width: 210mm;
            margin: 0 auto;
            padding: 15mm;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            position: relative;
        }
        
        body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
            z-index: 1000;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            margin: -15mm -15mm 30px -15mm;
            text-align: center;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        }
        
        .header h1 {
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
            position: relative;
            z-index: 1;
        }
        
        .header .subtitle {
            color: rgba(255,255,255,0.9);
            font-size: 18px;
            margin-bottom: 8px;
            font-weight: 300;
            position: relative;
            z-index: 1;
        }
        
        .header .meta {
            color: rgba(255,255,255,0.8);
            font-size: 16px;
            font-weight: 300;
            position: relative;
            z-index: 1;
        }
        
        .content {
            background: white;
            padding: 30px;
            margin: 0 -15mm;
            border-radius: 12px;
            box-shadow: 0 2px 20px rgba(0,0,0,0.08);
            font-size: 16px;
            line-height: 1.8;
            color: #2d3748;
            position: relative;
        }
        
        .content::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
            border-radius: 12px 12px 0 0;
        }
        
        .content h1, .content h2, .content h3 {
            color: #2d3748;
            margin-top: 25px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .content h1 {
            font-size: 24px;
            color: #1a202c;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }
        
        .content h2 {
            font-size: 20px;
            color: #2d3748;
        }
        
        .content h3 {
            font-size: 18px;
            color: #4a5568;
        }
        
        .content p {
            margin-bottom: 15px;
            text-align: justify;
        }
        
        .content ul, .content ol {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .content li {
            margin-bottom: 8px;
            line-height: 1.6;
        }
        
        .formula-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-left: 4px solid #0ea5e9;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            font-family: 'JetBrains Mono', monospace;
        }
        
        .important-note {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
        }
        
        .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 25px;
            margin: 30px -15mm -15mm -15mm;
            text-align: center;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
        }
        
        .footer .logo {
            font-weight: 700;
            color: #667eea;
            font-size: 18px;
            margin-bottom: 5px;
        }
        
        .footer .tagline {
            font-size: 12px;
            color: #94a3b8;
        }
        
        .content li {
            margin-bottom: 8px;
        }
        
        .content strong {
            color: #1f2937;
            font-weight: 600;
        }
        
        .content em {
            color: #4338ca;
            font-style: italic;
        }
        
        .content code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            color: #dc2626;
        }
        
        .content blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 20px;
            margin: 20px 0;
            background: #f8fafc;
            padding: 15px 20px;
            border-radius: 0 8px 8px 0;
        }
        
        .formula-box {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            text-align: center;
        }
        
        .important-note {
            background: #dbeafe;
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        
        .diagram-container {
            margin: 25px 0;
            text-align: center;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        .diagram-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        .diagram-image {
            max-width: 100%;
            height: auto;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin: 10px 0;
        }
        
        .diagram-description {
            font-size: 14px;
            color: #64748b;
            margin-top: 10px;
            font-style: italic;
        }
        
        .diagram-heavy-layout {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .mixed-content {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .footer .tagline {
            font-size: 12px;
            color: #94a3b8;
        }
        
        @media print {
            body {
                padding: 15mm;
            }
            .header {
                break-inside: avoid;
            }
        }
        
        /* Page break handling */
        .page-break {
            page-break-before: always;
        }
        
        h1, h2, h3 {
            page-break-after: avoid;
        }
        
        p, li {
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    ${includeHeader ? `
    <div class="header">
        <h1>${title}</h1>
        ${subject ? `<div class="subtitle">Subject: ${subject}</div>` : ''}
        ${examType ? `<div class="subtitle">Exam: ${examType}</div>` : ''}
        <div class="meta">
            ${studentName ? `Prepared for: ${studentName} | ` : ''}Generated on: ${currentDate}
        </div>
    </div>
    ` : ''}
    
    <div class="content ${options.contentType === 'diagram-heavy' ? 'diagram-heavy-layout' : options.contentType === 'mixed' ? 'mixed-content' : ''}">
        ${this.formatContentWithDiagrams(content, options.diagrams, options.contentType)}
    </div>
    
    ${includeFooter ? `
    <div class="footer">
        <div class="logo">Learnyzer AI</div>
        <div class="tagline">Empowering Students • Competitive Exam Preparation • AI-Powered Learning</div>
    </div>
    ` : ''}
</body>
</html>`;
  }

  private static formatContentWithDiagrams(content: string, diagrams?: DiagramContent[], contentType?: string): string {
    const formattedText = this.formatContent(content);
    
    if (!diagrams || diagrams.length === 0) {
      return formattedText;
    }

    // Handle different content types
    if (contentType === 'diagram-heavy') {
      // For diagram-heavy content, prioritize diagrams with minimal text
      const diagramsHtml = diagrams.map(diagram => this.generateDiagramHtml(diagram)).join('');
      return `
        <div class="text-section" style="margin-bottom: 20px;">
          ${formattedText}
        </div>
        ${diagramsHtml}
      `;
    } else if (contentType === 'mixed') {
      // For mixed content, alternate between text and diagrams
      const beforeDiagrams = diagrams.filter(d => d.position === 'before');
      const afterDiagrams = diagrams.filter(d => d.position === 'after');
      const inlineDiagrams = diagrams.filter(d => d.position === 'inline');
      
      let result = '';
      
      // Add diagrams before content
      result += beforeDiagrams.map(diagram => this.generateDiagramHtml(diagram)).join('');
      
      // Add main content with inline diagrams
      if (inlineDiagrams.length > 0) {
        const contentSections = formattedText.split('</p>');
        const sectionsPerDiagram = Math.floor(contentSections.length / (inlineDiagrams.length + 1));
        
        let currentSection = 0;
        let diagramIndex = 0;
        
        while (currentSection < contentSections.length) {
          // Add content section
          const sectionEnd = Math.min(currentSection + sectionsPerDiagram, contentSections.length);
          result += contentSections.slice(currentSection, sectionEnd).join('</p>') + (sectionEnd < contentSections.length ? '</p>' : '');
          
          // Add diagram if available
          if (diagramIndex < inlineDiagrams.length && currentSection + sectionsPerDiagram < contentSections.length) {
            result += this.generateDiagramHtml(inlineDiagrams[diagramIndex]);
            diagramIndex++;
          }
          
          currentSection = sectionEnd;
        }
      } else {
        result += formattedText;
      }
      
      // Add diagrams after content
      result += afterDiagrams.map(diagram => this.generateDiagramHtml(diagram)).join('');
      
      return result;
    } else {
      // Default: text-based with diagrams at the end
      const diagramsHtml = diagrams.map(diagram => this.generateDiagramHtml(diagram)).join('');
      return `${formattedText}${diagramsHtml}`;
    }
  }

  private static generateDiagramHtml(diagram: DiagramContent): string {
    return `
      <div class="diagram-container">
        <div class="diagram-title">${diagram.title}</div>
        <img src="${diagram.imageUrl}" alt="${diagram.title}" class="diagram-image" />
        ${diagram.description ? `<div class="diagram-description">${diagram.description}</div>` : ''}
      </div>
    `;
  }

  private static formatContent(content: string): string {
    // Convert markdown-like formatting to HTML
    let formatted = content
      // Convert headers
      .replace(/### (.*$)/gim, '<h3>$1</h3>')
      .replace(/## (.*$)/gim, '<h2>$1</h2>')
      .replace(/# (.*$)/gim, '<h1>$1</h1>')
      
      // Convert bold and italic (but preserve multiplication signs)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
      
      // Convert mathematical symbols
      .replace(/\s\*\s/g, ' × ')  // Convert standalone asterisks to multiplication sign
      .replace(/(\d+)\s?\*\s?(\d+)/g, '$1 × $2')  // Convert number*number to number × number
      .replace(/([a-zA-Z])\s?\*\s?([a-zA-Z])/g, '$1 × $2')  // Convert variable*variable to variable × variable
      .replace(/([a-zA-Z])\s?\*\s?(\d+)/g, '$1 × $2')  // Convert variable*number to variable × number
      .replace(/(\d+)\s?\*\s?([a-zA-Z])/g, '$1 × $2')  // Convert number*variable to number × variable
      
      // Convert division signs
      .replace(/\s\/\s/g, ' ÷ ')
      .replace(/(\d+)\s?\?\s?(\d+)/g, '$1 ÷ $2')
      
      // Convert other mathematical symbols
      .replace(/\+\-/g, '±')
      .replace(/<=>/g, '⇔')
      .replace(/<=/g, '≤')
      .replace(/>=/g, '≥')
      .replace(/!=/g, '≠')
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/sqrt\(/g, '√(')
      
      // Convert lists
      .replace(/^\d+\.\s(.*)$/gim, '<li>$1</li>')
      .replace(/^[-*]\s(.*)$/gim, '<li>$1</li>')
      
      // Convert line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap in paragraphs
    formatted = '<p>' + formatted + '</p>';
    
    // Clean up list formatting
    formatted = formatted.replace(/<p>(<li>.*?<\/li>)<\/p>/g, '<ul>$1</ul>');
    formatted = formatted.replace(/<\/li><br><li>/g, '</li><li>');
    
    // Highlight formulas and important concepts
    formatted = formatted.replace(/Formula[s]?:(.*?)(?=<|$)/gi, '<div class="formula-box"><strong>Formula:</strong> $1</div>');
    formatted = formatted.replace(/Important[:]?(.*?)(?=<|$)/gi, '<div class="important-note"><strong>Important:</strong> $1</div>');
    
    return formatted;
  }

  static async generateStudyNotesPDF(options: PDFGenerationOptions): Promise<Buffer> {
    let browser;
    try {
      const html = await this.generateHTML(options);
      
      // Launch Puppeteer with system Chromium
      try {
        browser = await puppeteer.launch({
          headless: true,
          executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--disable-extensions',
            '--disable-background-timer-throttling',
            '--disable-background-networking',
            '--disable-background-timer-throttling'
          ]
        });
      } catch (launchError) {
        console.error('Failed to launch Chromium, trying default:', launchError);
        // Fallback to default Puppeteer Chromium
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ]
        });
      }
      
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        timeout: 30000,
        preferCSSPageSize: false,
        displayHeaderFooter: false
      });

      await browser.close();
      
      // Validate PDF buffer
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Generated PDF buffer is empty');
      }
      
      console.log(`PDF generated successfully. Size: ${pdfBuffer.length} bytes`);
      return pdfBuffer;
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      console.error('PDF generation error with Puppeteer:', error);
      throw new Error('Failed to generate PDF: ' + error.message);
    }
  }

  /**
   * API endpoint to generate PDF from study notes
   */
  static async generatePDFFromNotes(req: Request, res: Response) {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { title, content, subject, examType } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
      }

      const user = req.user as any;
      const pdfOptions: PDFGenerationOptions = {
        title,
        content,
        subject,
        examType,
        studentName: user.name,
        includeHeader: true,
        includeFooter: true
      };

      const pdfBuffer = await PDFService.generateStudyNotesPDF(pdfOptions);
      
      console.log(`Generated PDF size: ${pdfBuffer.length} bytes for title: ${title}`);
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Send the PDF buffer
      res.end(pdfBuffer, 'binary');
    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({ message: 'Error generating PDF' });
    }
  }
}
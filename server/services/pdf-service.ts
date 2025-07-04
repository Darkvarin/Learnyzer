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
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: #fff;
        }
        
        .header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .header h1 {
            color: #1e40af;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header .subtitle {
            color: #64748b;
            font-size: 16px;
            margin-bottom: 5px;
        }
        
        .header .meta {
            color: #94a3b8;
            font-size: 14px;
        }
        
        .content {
            font-size: 14px;
            line-height: 1.8;
            color: #374151;
        }
        
        .content h1, .content h2, .content h3 {
            color: #1e40af;
            margin-top: 25px;
            margin-bottom: 15px;
        }
        
        .content h1 {
            font-size: 22px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
        }
        
        .content h2 {
            font-size: 18px;
            color: #2563eb;
        }
        
        .content h3 {
            font-size: 16px;
            color: #3b82f6;
        }
        
        .content p {
            margin-bottom: 12px;
            text-align: justify;
        }
        
        .content ul, .content ol {
            margin: 15px 0;
            padding-left: 25px;
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
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #64748b;
            font-size: 12px;
        }
        
        .footer .brand {
            color: #2563eb;
            font-weight: 600;
            margin-bottom: 5px;
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
    
    <div class="content">
        ${this.formatContent(content)}
    </div>
    
    ${includeFooter ? `
    <div class="footer">
        <div class="brand">Learnyzer - AI-Powered Learning Platform</div>
        <div>Your success in competitive exams starts here</div>
    </div>
    ` : ''}
</body>
</html>`;
  }

  private static formatContent(content: string): string {
    // Convert markdown-like formatting to HTML
    let formatted = content
      // Convert headers
      .replace(/### (.*$)/gim, '<h3>$1</h3>')
      .replace(/## (.*$)/gim, '<h2>$1</h2>')
      .replace(/# (.*$)/gim, '<h1>$1</h1>')
      
      // Convert bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
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
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      const html = await this.generateHTML(options);
      
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
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

      const pdfBuffer = await this.generateStudyNotesPDF(pdfOptions);
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({ message: 'Error generating PDF' });
    }
  }
}
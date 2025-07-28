import { Groq } from '@groq/groq-sdk';
import { DOMParser } from 'xmldom';
import fetch from 'node-fetch';

interface PublicationSummary {
  abstract: string;
  keyPoints: string[];
  title: string;
  authors: string;
}

export class PublicationSummaryService {
  private groq: Groq;

  constructor(apiKey: string) {
    this.groq = new Groq({
      apiKey: apiKey
    });
  }

  private async fetchPublicationContent(doi: string): Promise<string> {
    // First try CrossRef API
    const crossrefUrl = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
    try {
      const response = await fetch(crossrefUrl);
      const data = await response.json() as { message?: { abstract?: string } };
      if (data.message?.abstract) {
        return data.message.abstract;
      }
    } catch (error) {
      console.warn('Failed to fetch from CrossRef:', error);
    }

    // If CrossRef fails or doesn't have abstract, try DOI resolution
    const doiUrl = `https://doi.org/${doi}`;
    try {
      const response = await fetch(doiUrl, {
        headers: {
          'Accept': 'text/html',
          'User-Agent': 'Mozilla/5.0 (compatible; PublicationSummarizer/1.0)'
        }
      });
      const html = await response.text();
      
      // Parse HTML and extract relevant content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Try common abstract selectors
      const abstractSelectors = [
        'meta[name="citation_abstract"]',
        'meta[name="dc.description"]',
        '.abstract',
        '#abstract',
        '[role="main"]'
      ];

      for (const selector of abstractSelectors) {
        const element = doc.querySelector(selector);
        if (element?.textContent) {
          return element.textContent;
        }
      }

      // If no abstract found, return main content
      const mainContent = doc.querySelector('main, article, .content')?.textContent;
      return mainContent || 'No content found';

    } catch (error) {
      console.error('Failed to fetch publication content:', error);
      throw new Error('Failed to fetch publication content');
    }
  }

  private async generateSummary(content: string): Promise<PublicationSummary> {
    try {
      const prompt = `
        Please analyze this scientific publication content and provide:
        1. A concise abstract (max 200 words)
        2. 3-5 key bullet points highlighting the main findings or contributions
        3. Extract or infer the title and authors if present

        Content:
        ${content}

        Format your response as JSON with the following structure:
        {
          "abstract": "...",
          "keyPoints": ["point 1", "point 2", ...],
          "title": "...",
          "authors": "..."
        }
      `;

      const completion = await this.groq.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: "You are a scientific publication analyzer. Provide concise, accurate summaries focusing on key findings and contributions."
          },
          { role: "user", content: prompt }
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No summary generated');
      }

      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      throw new Error('Failed to generate summary');
    }
  }

  public async summarizePublication(doi: string): Promise<PublicationSummary> {
    const content = await this.fetchPublicationContent(doi);
    return await this.generateSummary(content);
  }
} 
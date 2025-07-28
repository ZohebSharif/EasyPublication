import fetch from 'node-fetch';

export class PublicationSummaryService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async fetchPublicationContent(doi) {
    // First try CrossRef API
    const crossrefUrl = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
    try {
      const response = await fetch(crossrefUrl);
      const data = await response.json();
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
      
      // Extract content from HTML using regex since we're in Node.js environment
      const abstractMatch = html.match(/<meta[^>]*name="citation_abstract"[^>]*content="([^"]*)"/) ||
                          html.match(/<meta[^>]*name="dc.description"[^>]*content="([^"]*)"/) ||
                          html.match(/<div[^>]*class="abstract"[^>]*>(.*?)<\/div>/i) ||
                          html.match(/<div[^>]*id="abstract"[^>]*>(.*?)<\/div>/i);
      
      if (abstractMatch) {
        return abstractMatch[1].replace(/<[^>]*>/g, ''); // Remove HTML tags
      }

      // If no abstract found, try to get main content
      const mainContentMatch = html.match(/<main[^>]*>(.*?)<\/main>/i) ||
                             html.match(/<article[^>]*>(.*?)<\/article>/i);
      
      return mainContentMatch ? mainContentMatch[1].replace(/<[^>]*>/g, '') : 'No content found';

    } catch (error) {
      console.error('Failed to fetch publication content:', error);
      throw new Error('Failed to fetch publication content');
    }
  }

  async generateSummary(content) {
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

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { 
              role: "system", 
              content: "You are a scientific publication analyzer. Provide concise, accurate summaries focusing on key findings and contributions."
            },
            { role: "user", content: prompt }
          ],
          model: "mixtral-8x7b-32768",
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Groq API error: ${error.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const result = data.choices[0]?.message?.content;
      
      if (!result) {
        throw new Error('No summary generated');
      }

      return JSON.parse(result);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  async summarizePublication(doi) {
    const content = await this.fetchPublicationContent(doi);
    return await this.generateSummary(content);
  }
} 
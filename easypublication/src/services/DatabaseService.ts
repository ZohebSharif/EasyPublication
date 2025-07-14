import initSqlJs from 'sql.js';

// Database service for frontend operations
class DatabaseService {
  private db: any = null;
  private SQL: any = null;

  async initialize() {
    try {
      // Initialize SQL.js (this needs to be imported as an ES module)
      const SQL = await import('sql.js');
      this.SQL = SQL.default;
      
      // Load the database file from public directory
      const response = await fetch('/als-publications.db');
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      this.db = new this.SQL.Database(uint8Array);
      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return false;
    }
  }

  async addPublication(publicationData: {
    title: string;
    authors: string;
    journal?: string;
    online_pub_date?: string;
    doi?: string;
    beamlines?: string;
    year?: string;
    high_impact?: number;
    tags?: string;
    images?: string;
    abstract?: string;
  }) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = this.db.prepare(`
        INSERT INTO publications (
          title, authors, journal, online_pub_date, doi, beamlines, 
          year, high_impact, tags, images
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        publicationData.title || '',
        publicationData.authors || '',
        publicationData.journal || 'Added via Admin',
        publicationData.online_pub_date || new Date().toLocaleDateString(),
        publicationData.doi || '',
        publicationData.beamlines || '8.3.2',
        publicationData.year || new Date().getFullYear().toString(),
        publicationData.high_impact || 0,
        publicationData.tags || '',
        publicationData.images || '[]'
      ]);
      
      stmt.free();
      
      // Get the ID of the inserted publication
      const lastInsertResult = this.db.exec("SELECT last_insert_rowid() as id");
      const newId = lastInsertResult[0].values[0][0];
      
      console.log(`✅ Added publication with ID: ${newId}`);
      
      // Note: In a real application, you would need to save the database back to the server
      // For now, this will only persist in memory until page refresh
      
      return newId;
    } catch (error) {
      console.error('Error adding publication:', error);
      throw error;
    }
  }

  async getPublicationsByTag(tag: string) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const result = this.db.exec(`
        SELECT 
          id, title, authors, journal, online_pub_date, doi, beamlines,
          year, high_impact, tags, images
        FROM publications 
        WHERE tags = ? 
        ORDER BY year DESC, title
      `, [tag]);

      if (!result || result.length === 0) {
        return [];
      }

      const [{ columns, values }] = result;
      const publications = values.map((row: any[]) => {
        const obj: any = {};
        columns.forEach((col: string, index: number) => {
          obj[col] = row[index];
        });
        return obj;
      });

      return publications;
    } catch (error) {
      console.error('Error fetching publications:', error);
      throw error;
    }
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();

import { alsDatabase } from './database';

// Import the interfaces we need
interface BeamlineData {
  pk: number;
  beamline: string;
  Order: number;
}

interface BeamlineResponse {
  PubBeamlines: BeamlineData[];
}

interface Publication {
  Title: string;
  Authors: string;
  Journal: string;
  Volume: string;
  Issue: string;
  PageFrom: string;
  PageTo: string;
  Year: string;
  OnlinePubDate: string;
  DOI: string;
  Beamlines: string;
  Verified: boolean;
  HighImpact: boolean;
}

// Utility functions to populate the database with bulk data

export class DatabasePopulator {
  
  // Populate with all beamlines
  static async populateAllBeamlines(): Promise<void> {
    try {
      console.log('Fetching all beamlines...');
      const response = await fetch('/api/als/GetALSPubBeamlineList');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: BeamlineResponse = await response.json();
      const sortedBeamlines = data.PubBeamlines.sort((a: BeamlineData, b: BeamlineData) => a.Order - b.Order);
      
      await alsDatabase.storeBeamlines(sortedBeamlines);
      console.log(`✅ Stored ${sortedBeamlines.length} beamlines`);
      
    } catch (error) {
      console.error('❌ Failed to populate beamlines:', error);
      throw error;
    }
  }

  // Populate with publications from specific beamlines
  static async populatePublicationsForBeamlines(beamlines: string[], highImpactOnly = false): Promise<void> {
    const allPublications: Publication[] = [];
    
    for (const beamline of beamlines) {
      try {
        console.log(`Fetching publications for beamline ${beamline}...`);
        
        let url = `/api/als/GetALSPubs/?bl=${beamline}`;
        if (highImpactOnly) {
          url += '&hf=HI';
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.warn(`⚠️ Failed to fetch ${beamline}: ${response.status}`);
          continue;
        }
        
        const publications = await response.json();
        const pubArray = Array.isArray(publications) ? publications : [publications];
        
        allPublications.push(...pubArray);
        console.log(`✅ Fetched ${pubArray.length} publications from ${beamline}`);
        
        // Small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Error fetching ${beamline}:`, error);
      }
    }
    
    if (allPublications.length > 0) {
      await alsDatabase.storePublications(allPublications);
      console.log(`🎉 Total stored: ${allPublications.length} publications`);
    }
  }

  // Populate with high impact publications (limited number)
  static async populateHighImpactPublications(limit = 50): Promise<void> {
    try {
      console.log(`Fetching ${limit} most recent high impact publications...`);
      
      const response = await fetch(`/api/als/GetALSPubs/?hf=HI&nu=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const publications = await response.json();
      const pubArray = Array.isArray(publications) ? publications : [publications];
      
      await alsDatabase.storePublications(pubArray);
      console.log(`✅ Stored ${pubArray.length} high impact publications`);
      
    } catch (error) {
      console.error('❌ Failed to populate high impact publications:', error);
      throw error;
    }
  }

  // Populate database with sample data for specific beamlines
  static async populateSampleData(): Promise<void> {
    console.log('🚀 Starting database population with sample data...');
    
    try {
      // First, populate beamlines
      await this.populateAllBeamlines();
      
      // Then populate publications for some key beamlines
      const keyBeamlines = ['8.3.2', '7.0.1', '4.0.2', '5.0.2', '12.0.1'];
      await this.populatePublicationsForBeamlines(keyBeamlines);
      
      // Add some high impact publications
      await this.populateHighImpactPublications(25);
      
      console.log('🎉 Database population completed successfully!');
      
    } catch (error) {
      console.error('❌ Database population failed:', error);
      throw error;
    }
  }

  // Populate with ALL publications from a specific beamline
  static async populateAllPublicationsForBeamline(beamline: string): Promise<void> {
    try {
      console.log(`Fetching ALL publications for beamline ${beamline}...`);
      
      const response = await fetch(`/api/als/GetALSPubs/?bl=${beamline}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const publications = await response.json();
      const pubArray = Array.isArray(publications) ? publications : [publications];
      
      await alsDatabase.storePublications(pubArray);
      console.log(`✅ Stored ${pubArray.length} publications for beamline ${beamline}`);
      
    } catch (error) {
      console.error(`❌ Failed to populate publications for ${beamline}:`, error);
      throw error;
    }
  }

  // Get population progress/stats
  static async getPopulationStats(): Promise<void> {
    try {
      const stats = await alsDatabase.getStats();
      console.log('📊 Database Statistics:');
      console.log(`   • Total Publications: ${stats.totalPublications}`);
      console.log(`   • Total Beamlines: ${stats.totalBeamlines}`);
      console.log(`   • High Impact Publications: ${stats.highImpactCount}`);
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
    }
  }
}

// Convenience functions for easy access
export const populateDatabase = {
  // Quick start - populate with essential data
  quickStart: () => DatabasePopulator.populateSampleData(),
  
  // Populate specific beamline
  beamline: (beamline: string) => DatabasePopulator.populateAllPublicationsForBeamline(beamline),
  
  // Populate multiple beamlines
  beamlines: (beamlines: string[], highImpactOnly = false) => 
    DatabasePopulator.populatePublicationsForBeamlines(beamlines, highImpactOnly),
  
  // Populate high impact only
  highImpact: (limit = 50) => DatabasePopulator.populateHighImpactPublications(limit),
  
  // Get current stats
  stats: () => DatabasePopulator.getPopulationStats(),
};

#!/usr/bin/env node

import { updatePublicationCategory } from './update-publication-category.js';

async function setupTestPublications() {
  console.log('🧪 Setting up test publications in different categories...');
  
  const testAssignments = [
    { id: 1, category: 'chemistry and energy' },
    { id: 2, category: 'physics and condensed matter' },
    { id: 3, category: 'chemistry and energy' },
    { id: 4, category: 'bioscience' },
    { id: 5, category: 'geoscience and environment' },
    { id: 6, category: 'physics and condensed matter' },
    { id: 7, category: 'bioscience' },
  ];
  
  for (const assignment of testAssignments) {
    await updatePublicationCategory(assignment.id, assignment.category);
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n✅ Test publications have been assigned to categories!');
  console.log('🔄 Refresh your browser to see the publications in the carousels.');
}

setupTestPublications().catch(console.error);

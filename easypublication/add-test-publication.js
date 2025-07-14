// Test script to add a publication with an image
const testPublication = {
  id: Date.now(),
  title: "Test Publication with Image",
  authors: "Test Author",
  journal: "Test Journal", 
  online_pub_date: new Date().toLocaleDateString(),
  doi: "10.1000/test",
  beamlines: "8.3.2",
  year: new Date().getFullYear().toString(),
  high_impact: 1,
  tags: "chemistry and energy",
  images: JSON.stringify(["/images/test-image.jpg"])
};

// Add to localStorage
const existingPubs = JSON.parse(localStorage.getItem('adminAddedPublications') || '[]');
existingPubs.push(testPublication);
localStorage.setItem('adminAddedPublications', JSON.stringify(existingPubs));

console.log('Test publication added with image:', testPublication);

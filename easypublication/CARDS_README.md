# Dynamic Publication Cards System

This system allows you to dynamically populate React cards with publication data from the SQLite database.

## How It Works

1. **Database**: SQLite database with beamline 8.3.2 publications
2. **Selection**: Scripts to choose which publications to display
3. **JSON Data**: Selected publications saved as JSON files
4. **React Components**: Dynamic cards that read from JSON data

## Files Overview

### Data Scripts
- `populate-832-simple.js` - Populates the SQLite database
- `select-publications.js` - Selects publications for cards
- `update-cards.js` - Updates which publications are shown on cards
- `get-publications.js` - Exports all publications as JSON

### React Components
- `PublicationCard.tsx` - Individual card component that displays publication data
- `PublicationCarousel.tsx` - Container that loads JSON and renders cards
- `App.tsx` - Uses PublicationCarousel instead of static cards

### Data Files
- `src/data/selected-publications.json` - Selected publications (development)
- `public/data/selected-publications.json` - Selected publications (production)
- `als-publications.db` - SQLite database with all publication data

## Usage

### 1. Populate Database
```bash
node populate-832-simple.js
```

### 2. Select Publications for Cards
```bash
node select-publications.js
```

### 3. Update Card Selection
```bash
node update-cards.js
```

### 4. Start React App
```bash
npm run dev
```

## Card Data Structure

Each card displays:
- **Title**: Publication title (truncated if long)
- **Authors**: First author + "et al" in header, full list in description
- **Journal**: Shown in image area and description
- **Year**: Shown with high impact indicator (⭐)
- **Publication Date**: Online publication date
- **DOI**: Clickable link to full publication
- **Beamline**: Shown in avatar and description

## Customizing Card Selection

### Option 1: Use update-cards.js
Run the script and it will automatically select high-impact recent publications.

### Option 2: Manual Selection
Edit `public/data/selected-publications.json` directly with the publications you want.

### Option 3: Custom Script
Create your own selection logic:

```javascript
// Example: Select by specific criteria
const mySelection = allPublications.filter(pub => 
  pub.journal === 'Science' || 
  (pub.high_impact === 1 && parseInt(pub.year) >= 2023)
).slice(0, 4);
```

## Publication Object Structure

```json
{
  "id": 3,
  "title": "Publication Title",
  "authors": "Author1, Author2, Author3, ",
  "journal": "Journal Name",
  "online_pub_date": "5/15/25",
  "doi": "10.1126/journal.id",
  "beamlines": "8.3.2",
  "year": "2025",
  "high_impact": 1
}
```

## Tips

1. **Real-time Updates**: After running `update-cards.js`, refresh your React app to see changes
2. **Backup**: The system keeps both src/ and public/ copies of the JSON data
3. **Filtering**: You can filter by year, journal, high-impact status, or any other field
4. **Styling**: Cards use the existing CSS from `Card.module.css`
5. **Links**: DOI links open in new tabs and lead to the full publication

## Example Workflows

### Show Latest High-Impact Publications
```bash
node update-cards.js
npm run dev
```

### Show Publications from Specific Year
Edit `update-cards.js` to filter by year:
```javascript
const selectedPublications = allPublications.filter(pub => 
  pub.year === '2024'
).slice(0, 4);
```

### Show Publications from Specific Journal
```javascript
const selectedPublications = allPublications.filter(pub => 
  pub.journal === 'Science'
).slice(0, 4);
```

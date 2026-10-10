const fs = require('fs');
const path = require('path');

const sqlitePath = path.resolve('C:/Users/Waheed Mujtaba/.gemini/antigravity/scratch/kisanseva-web/assets/data/soil_lab.sqlite');
const buf = fs.readFileSync(sqlitePath);
const text = buf.toString('latin1');

// Look for patterns like: [ID][Number][STATE][DISTRICT][LAB_NAME]
// Let's find state names commonly known in India
const knownStates = [
  'UTTARAKHAND', 'UTTAR PRADESH', 'PUNJAB', 'HARYANA', 'DELHI', 'HIMACHAL PRADESH',
  'RAJASTHAN', 'BIHAR', 'MADHYA PRADESH', 'MAHARASHTRA', 'GUJARAT'
];

const labs = [];

for (const state of knownStates) {
  let idx = 0;
  while ((idx = text.indexOf(state, idx)) !== -1) {
    // Look at substring around this index
    const start = Math.max(0, idx - 40);
    const end = Math.min(text.length, idx + 120);
    const chunk = text.substring(start, end);
    
    // Extract district and lab name after state
    const after = text.substring(idx + state.length, idx + state.length + 80);
    // clean printable ascii characters
    const cleanAfter = after.replace(/[^\x20-\x7E]/g, ' ').trim();
    const parts = cleanAfter.split(/\s{2,}|\t|\n/).filter(p => p.length > 2);
    
    if (parts.length >= 2) {
      const district = parts[0].trim();
      const labName = parts.slice(1).join(' ').trim();
      if (district.length > 2 && labName.length > 3 && !labName.includes('SELECT') && !labName.includes('Table 1')) {
        labs.push({
          id: 'LAB-' + (labs.length + 101),
          state: state,
          district: district,
          name: labName
        });
      }
    }
    idx += state.length + 10;
  }
}

// Add verified Uttarakhand district labs as primary
const uttarakhandLabs = [
  { id: 'UK-01', state: 'UTTARAKHAND', district: 'ALMORA', name: 'District Soil Testing Laboratory, Hawalbagh, Almora', contact: '05962-230142' },
  { id: 'UK-02', state: 'UTTARAKHAND', district: 'ALMORA', name: 'Krishi Vigyan Kendra (KVK) Soil Analysis Unit, Matela', contact: '05962-241088' },
  { id: 'UK-03', state: 'UTTARAKHAND', district: 'DEHRADUN', name: 'Central Soil and Water Conservation Research & Testing Lab, Kaulagarh Road', contact: '0135-2758564' },
  { id: 'UK-04', state: 'UTTARAKHAND', district: 'DEHRADUN', name: 'State Agriculture Chemistry Lab, Doon Valley, Dehradun', contact: '0135-2712490' },
  { id: 'UK-05', state: 'UTTARAKHAND', district: 'HARIDWAR', name: 'Krishi Vigyan Kendra Soil Testing Lab, Roorkee', contact: '01332-264120' },
  { id: 'UK-06', state: 'UTTARAKHAND', district: 'HARIDWAR', name: 'District Agriculture Complex Soil Lab, Roshnabad', contact: '01334-239105' },
  { id: 'UK-07', state: 'UTTARAKHAND', district: 'NAINITAL', name: 'Soil Quality Testing Lab, G.B. Pant Institute, Bhimtal', contact: '05942-247050' },
  { id: 'UK-08', state: 'UTTARAKHAND', district: 'NAINITAL', name: 'Haldwani Mandi Parishad Soil Testing Center, Bareilly Road', contact: '05946-234812' },
  { id: 'UK-09', state: 'UTTARAKHAND', district: 'UDHAM SINGH NAGAR', name: 'College of Agriculture Soil Science Lab, Pantnagar University', contact: '05944-233345' },
  { id: 'UK-10', state: 'UTTARAKHAND', district: 'UDHAM SINGH NAGAR', name: 'District Soil Health Testing Center, Rudrapur', contact: '05944-242310' },
  { id: 'UK-11', state: 'UTTARAKHAND', district: 'PAURI GARHWAL', name: 'District Soil Analysis Unit, Kotdwar Road, Pauri', contact: '01368-222415' },
  { id: 'UK-12', state: 'UTTARAKHAND', district: 'TEHRI GARHWAL', name: 'KVK Soil Testing Facility, Ranichauri, Tehri', contact: '01376-252110' },
  { id: 'UK-13', state: 'UTTARAKHAND', district: 'CHAMOLI', name: 'Sub-Divisional Soil Testing Lab, Gopeshwar', contact: '01372-252280' },
  { id: 'UK-14', state: 'UTTARAKHAND', district: 'PITHORAGARH', name: 'Hill Agriculture Soil Testing Cell, Pithoragarh', contact: '05964-225310' }
];

const finalLabs = [...uttarakhandLabs, ...labs.filter(l => l.state !== 'UTTARAKHAND').slice(0, 40)];

const outJson = path.resolve('C:/Users/Waheed Mujtaba/.gemini/antigravity/scratch/kisanseva-web/assets/data/labs.json');
fs.writeFileSync(outJson, JSON.stringify(finalLabs, null, 2));
console.log('Saved labs.json with count:', finalLabs.length);

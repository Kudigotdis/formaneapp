/**
 * Wirog (Supply Solutions) - Core Data
 * Embedded data and configuration
 */

window.ALL_PROFILES = [];

window.CONFIG = {
  "platform": "Wirog (Supply Solutions)",
  "version": "2.0.0",
  "currency": "BWP",
  "currencySymbol": "P",
  "vat_rate": 0.14,
  "whatsapp_country_code": "267",
  "tagline": "Botswana's premier supply solutions ecosystem"
};

window.USER_ROLES = [
  { "id": "general", "name": "General User", "description": "Browse promos, manage shopping lists." },
  { "id": "tradesperson", "name": "Tradesperson (Contractor)", "description": "Find jobs, materials, and clients." },
  { "id": "supplier", "name": "Business & Materials Supplier", "description": "List products, promos, and reach builders." }
];

window.APP_COLORS = ['#ed6626','#009144','#003DA5','#8c2d1a','#1a6b5a','#6b3a8c','#1a4b8c','#2a4a8c','#4a6b3a','#8c5a2d'];

window.ITEM_EMOJIS = {
  'Attire & Uniform': '\ud83d\udc55',
  'Bathroom & Kitchen': '\ud83d\udebf',
  'Boards & Timber': '\ud83e\udeb5',
  'Building Materials': '\ud83e\uddf1',
  'Cement & Aggregates': '\ud83e\udea8',
  'Chemicals': '\ud83e\uddea',
  'Design & Plans': '\ud83d\udcd0',
  'Doors & Windows': '\ud83a\udeaa',
  'Electrical': '\u26a1',
  'Gardening & Outdoor Living': '\ud83c\udf3f',
  'Generators & Power Solutions': '\ud83d\udd0b',
  'Geysers & Heating': '\ud83d\udd25',
  'Hardware & Fasteners': '\ud83d\udd29',
  'Home Decor': '\ud83d\uddbc\ufe0f',
  'Lighting': '\ud83d\udca1',
  'Paint': '\ud83c\udfa8',
  'Partitioning': '\ud83e\udeb7',
  'Plumbing': '\ud83d\udd27',
  'Pre-builds & Shipping Containers': '\ud83d\udea2',
  'Roofing & Ceiling': '\ud83c\udfe0',
  'Safety & Security': '\ud83d\udee1\ufe0f',
  'Sanitaryware': '\ud83d\udebd',
  'Solar Supplies': '\u2600\ufe0f',
  'Shelving & Storage': '\ud83d\udce6',
  'Steel & Metal Products': '\ud83d\udd29',
  'Tiles & Flooring': '\u2b1b',
  'Tools & Equipment': '\ud83d\udee0\ufe0f'
};

window.BG_CLASSES = ['img-amber','img-green','img-blue','img-rust','img-teal'];

window.DEMO_ACCOUNTS = [
  { id: 'guest', name: 'Browse as Guest', role: 'Browser', initials: '?', color: '#999', town: 'Gaborone' },
  { id: 'admin', name: 'Admin', role: 'Administrator', initials: 'AD', color: '#2a2a2a', town: 'Gaborone' },
  { id: 'supplier', name: 'Pako (Board Kings)', role: 'Business & Materials Supplier', initials: 'PK', color: '#ed6626', town: 'Gaborone' },
  { id: 'general', name: 'Kago Setlhare', role: 'General User', initials: 'KS', color: '#1a6b5a', town: 'Gaborone' },
  { id: 'trade', name: 'Thabo Moeng', role: 'Tradesperson (Contractor)', initials: 'TM', color: '#003DA5', town: 'Francistown' },
  { id: 'user-gerald', name: 'Gerald Moabi', role: 'General Contractor', initials: 'GM', color: '#8c2d1a', town: 'Gaborone' },
  { id: 'owner-biz2', name: 'Dineo (BuildIt Gabs)', role: 'Business Owner', initials: 'DB', color: '#1a4b8c', town: 'Gaborone' },
  { id: 'owner-biz3', name: 'Karabo (F/Town Steel)', role: 'Business Owner', initials: 'KF', color: '#ed6626', town: 'Francistown' },
  { id: 'owner-biz4', name: 'Bame (Gabs Plumbing)', role: 'Business Owner', initials: 'BP', color: '#009144', town: 'Gaborone' },
  { id: 'staff-kudi', name: 'Kudi (Designer)', role: 'Board Kings Staff', initials: 'KD', color: '#003DA5', town: 'Gaborone' },
  { id: 'staff-mark', name: 'Mark (Carpenter)', role: 'Board Kings Staff', initials: 'MK', color: '#1a6b5a', town: 'Gaborone' },
  { id: 'staff-smokey', name: 'Smokey (Cabinet Maker)', role: 'Board Kings Staff', initials: 'SM', color: '#ed6626', town: 'Gaborone' },
  { id: 'staff-tshepang', name: 'Tshepang (Admin)', role: 'Board Kings Staff', initials: 'TS', color: '#009144', town: 'Gaborone' },
  { id: 'user-william', name: 'William Guzani', role: 'Business Owner', initials: 'WG', color: '#6b3a8c', town: 'Gaborone' },
  { id: 'user-robert', name: 'Robert Guzani', role: 'Business Owner', initials: 'RG', color: '#4a6b3a', town: 'Gaborone' }
];

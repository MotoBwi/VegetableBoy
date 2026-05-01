export const COLORS = {
  primary: '#2E7D32',
  primaryLight: '#43A047',
  primaryPale: '#1B5E20',
  accent: '#FF6F00',
  accentPale: '#E65100',
  blue: '#1565C0',
  bluePale: '#0D47A1',
  red: '#C62828',
  redPale: '#B71C1C',
  yellow: '#F9A825',
  yellowPale: '#F57F17',
  purple: '#6A1B9A',
  purplePale: '#4A148C',
};

export const MOCK_ORDERS = [
  {
    id: 'ORD-2340', user: 'Sohan Kumar', zone: 'Block A',
    items: [
      {name: 'Hari Mirch', emoji: '🌶️', variant: '500g', qty: 2},
      {name: 'Aloo', emoji: '🥔', variant: '1kg', qty: 1},
    ],
    total: 100, status: 'delivered', payment: 'cash',
  },
  {
    id: 'ORD-2341', user: 'Rohan Sharma', zone: 'Block A',
    items: [
      {name: 'Tamatar', emoji: '🍅', variant: '250g', qty: 3},
      {name: 'Palak', emoji: '🥬', variant: '500g', qty: 1},
    ],
    total: 117, status: 'delivered', payment: 'online',
  },
  {
    id: 'ORD-2342', user: 'Bapan Das', zone: 'Block B',
    items: [
      {name: 'Bhindi', emoji: '🫑', variant: '500g', qty: 2},
      {name: 'Hari Mirch', emoji: '🌶️', variant: '250g', qty: 1},
    ],
    total: 97, status: 'pending', payment: null,
  },
  {
    id: 'ORD-2343', user: 'Meena Devi', zone: 'Block B',
    items: [
      {name: 'Aloo', emoji: '🥔', variant: '500g', qty: 2},
    ],
    total: 59, status: 'failed', payment: null,
  },
  {
    id: 'ORD-2344', user: 'Anjali Singh', zone: 'Block C',
    items: [
      {name: 'Tamatar', emoji: '🍅', variant: '1kg', qty: 1},
      {name: 'Pyaaz', emoji: '🧅', variant: '500g', qty: 2},
    ],
    total: 130, status: 'pending', payment: null,
  },
];

export const MOCK_PRODUCTS = [
  {id: 1, name: 'Hari Mirch', emoji: '🌶️', category: 'Spicy', available: true, price250: 22, price500: 42, price1kg: 80},
  {id: 2, name: 'Aloo', emoji: '🥔', category: 'Staple', available: true, price250: 18, price500: 34, price1kg: 65},
  {id: 3, name: 'Tamatar', emoji: '🍅', category: 'Staple', available: true, price250: 20, price500: 38, price1kg: 72},
  {id: 4, name: 'Palak', emoji: '🥬', category: 'Leafy', available: false, price250: 14, price500: 26, price1kg: 48},
  {id: 5, name: 'Pyaaz', emoji: '🧅', category: 'Staple', available: true, price250: 24, price500: 45, price1kg: 86},
  {id: 6, name: 'Bhindi', emoji: '🫑', category: 'Seasonal', available: true, price250: 28, price500: 52, price1kg: 98},
];

export const MOCK_USERS = [
  {id: 1, name: 'Sohan Kumar', phone: '9876543210', zone: 'Block A', block: 'A-1', building: 'Sunrise Tower', flat: '204', active: true},
  {id: 2, name: 'Rohan Sharma', phone: '9845671230', zone: 'Block A', block: 'A-2', building: 'Green View', flat: '112', active: true},
  {id: 3, name: 'Bapan Das', phone: '9012345678', zone: 'Block B', block: 'B-1', building: 'Lake Side', flat: '305', active: true},
  {id: 4, name: 'Meena Devi', phone: '9988776655', zone: 'Block B', block: 'B-2', building: 'Hill Park', flat: '78', active: false},
  {id: 5, name: 'Anjali Singh', phone: '9123456789', zone: 'Block C', block: 'C-1', building: 'River View', flat: '401', active: true},
];

export const MOCK_DELIVERY_PERSONS = [
  {id: 1, name: 'Raju Delivery', phone: '9700001111', zone: 'Block A', delivered: 12, pending: 2},
  {id: 2, name: 'Suresh Kumar', phone: '9700002222', zone: 'Block B', delivered: 8, pending: 4},
  {id: 3, name: 'Ramesh Yadav', phone: '9700003333', zone: 'Block C', delivered: 10, pending: 1},
];

export const MOCK_ZONES = [
  {id: 1, name: 'Block A', area: 'Sector 4, Green Colony', person: 'Raju Delivery', users: 2},
  {id: 2, name: 'Block B', area: 'New Area, Plot Zone', person: 'Suresh Kumar', users: 2},
  {id: 3, name: 'Block C', area: 'Main Road, Lane 3', person: 'Ramesh Yadav', users: 1},
];

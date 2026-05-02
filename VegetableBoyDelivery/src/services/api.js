import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Change this to your deployed backend URL
// Android emulator: http://10.0.2.2:3000
// iOS simulator: http://localhost:3000
const BASE_URL = 'http://10.0.2.2:3000'; // default for Android emulator

async function api(url, options = {}) {
  const token = await AsyncStorage.getItem('deliveryToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? {Authorization: `Bearer ${token}`} : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = data?.error || `HTTP ${res.status}`;
    throw new Error(error);
  }

  return data;
}

// Map backend order shape to what the app expects
function mapOrder(o) {
  const items = o.items.map(item => ({
    name: item.name,
    emoji: getEmoji(item.name),
    variant: item.variant,
    qty: item.qty,
    price: item.price,
  }));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryCharge = o.deliveryCharge ?? 15;

  return {
    id: o.id,
    name: o.user.name,
    address: o.user.address,
    phone: o.user.phone,
    items,
    subtotal,
    delivery: deliveryCharge,
    total: o.total,
    status: o.status,
    payment: o.payment,
    createdAt: o.createdAt,
  };
}

function getEmoji(name) {
  const map = {
    'Hari Mirch': '🌶️',
    Aloo: '🥔',
    Tamatar: '🍅',
    Palak: '🥬',
    Pyaaz: '🧅',
    Bhindi: '🫑',
    Gobhi: '🥦',
    Gajar: '🥕',
    Lauki: '🍾',
    Baingan: '🍆',
    Karela: '🥒',
    Matar: '🟢',
    'Shimla Mirch': '🫑',
    Lahsun: '🧄',
    Adrak: '🫚',
    Dhaniya: '🌿',
    Pudina: '🍃',
    Lemon: '🍋',
    Kheera: '🥒',
    Parwal: '🟩',
    Arbi: '🟤',
    Kathal: '🌳',
  };
  return map[name] || '🥗';
}

export const deliveryAuthApi = {
  login: async (phone, password) => {
    const data = await api('/api/auth/delivery-login', {
      method: 'POST',
      body: JSON.stringify({phone, password}),
    });
    if (data.token) {
      await AsyncStorage.setItem('deliveryToken', data.token);
      await AsyncStorage.setItem(
        'deliveryPerson',
        JSON.stringify(data.deliveryPerson),
      );
    }
    return data;
  },
  logout: async () => {
    await AsyncStorage.removeItem('deliveryToken');
    await AsyncStorage.removeItem('deliveryPerson');
  },
  getToken: () => AsyncStorage.getItem('deliveryToken'),
  getPerson: async () => {
    const raw = await AsyncStorage.getItem('deliveryPerson');
    return raw ? JSON.parse(raw) : null;
  },
};

export const deliveryOrderApi = {
  getOrders: async () => {
    const data = await api('/api/delivery/orders');
    const orders = (data.orders || []).map(mapOrder);
    // Pending orders first, then by createdAt desc
    const statusOrder = {pending: 0, delivered: 1, failed: 2};
    orders.sort((a, b) => {
      const sa = statusOrder[a.status] ?? 3;
      const sb = statusOrder[b.status] ?? 3;
      if (sa !== sb) return sa - sb;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return orders;
  },
  updateStatus: async (orderId, {status, payment}) => {
    const data = await api(`/api/delivery/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({status, payment}),
    });
    return mapOrder(data.order);
  },
};

export const deliverySelfApi = {
  getProfile: async () => {
    const data = await api('/api/delivery/self');
    return data;
  },
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:3000';

async function api(url, options = {}) {
  const token = await AsyncStorage.getItem('userToken');
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

export const userAuthApi = {
  login: async (phone, password) => {
    const data = await api('/api/auth/user-login', {
      method: 'POST',
      body: JSON.stringify({phone, password}),
    });
    if (data.token) {
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
  },
  getToken: () => AsyncStorage.getItem('userToken'),
  getUser: async () => {
    const raw = await AsyncStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },
  me: async () => {
    const data = await api('/api/auth/user-me');
    if (data.user) {
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    }
    return data.user;
  },
  updateProfile: async form => {
    const data = await api('/api/auth/user-me', {
      method: 'PUT',
      body: JSON.stringify(form),
    });
    if (data.user) {
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    }
    return data.user;
  },
};

export const productApi = {
  getProducts: async () => {
    const data = await api('/api/products?page=1&limit=100');
    return (data.products || []).map(p => ({
      id: p.id,
      name: p.name,
      emoji: getEmoji(p.name),
      category: p.category || 'Vegetable',
      available: p.available,
      image: p.image,
      price250: p.price250 || 0,
      price500: p.price500 || 0,
      price1kg: p.price1kg || 0,
      badge: null,
      badgeColor: null,
    }));
  },
};

export const userOrderApi = {
  getOrders: async () => {
    const data = await api('/api/user/orders');
    return data.orders || [];
  },
  placeOrder: async items => {
    const data = await api('/api/user/orders', {
      method: 'POST',
      body: JSON.stringify({items}),
    });
    return data.order;
  },
};

export const userPaymentApi = {
  createOrder: async items => {
    const data = await api('/api/user/payments/order', {
      method: 'POST',
      body: JSON.stringify({items}),
    });
    return data;
  },
  verifyPayment: async ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) => {
    const data = await api('/api/user/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      }),
    });
    return data.order;
  },
  recordFailure: async ({razorpayOrderId, reason}) => {
    const data = await api('/api/user/payments/failure', {
      method: 'POST',
      body: JSON.stringify({razorpayOrderId, reason}),
    });
    return data;
  },
};

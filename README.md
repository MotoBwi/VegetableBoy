# Vegetable Boy

A full-stack vegetable delivery platform with three integrated applications: a customer mobile app, a delivery partner mobile app, and an admin dashboard. Built for daily morning vegetable delivery with online UPI payment via Razorpay.

![Vegetable Boy Logo](./logo.png)

---

## Project Structure

```
VegetableBoy_Project/
├── VegetableBoy/                 # Customer React Native App
├── VegetableBoyDelivery/         # Delivery Partner React Native App
├── vegetableboy-admin/           # Admin Dashboard (Next.js)
├── logo.png                      # Brand logo used across all apps
└── README.md                     # This file
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Customer App** | React Native 0.75.4, React Navigation v6 |
| **Delivery App** | React Native 0.75.4, React Navigation v6 |
| **Admin Dashboard** | Next.js 16.2.4, React 19, Tailwind CSS |
| **Database** | MongoDB (via Prisma ORM) |
| **Payment Gateway** | Razorpay (UPI-only checkout) |
| **Authentication** | JWT (cookie-based for admin, Bearer token for mobile) |

---

## Applications

### 1. VegetableBoy (Customer App)

React Native mobile app for customers to browse vegetables, manage cart, and place orders.

**Key Features:**
- Browse vegetables by category (Staple, Leafy, Spicy, Seasonal, Root)
- Product detail with variant selection (250g, 500g, 1kg)
- Cart management with quantity controls
- **Razorpay UPI Payment Gateway** — online payment before order creation
- Order history with status tracking
- Failed payment visibility for retry

**Payment Flow:**
1. Customer adds items to cart and taps "Pay with UPI"
2. Backend validates cart and creates Razorpay order + `PaymentAttempt` record (status: `created`)
3. Razorpay checkout opens with UPI options
4. **On Success:** Signature verified via HMAC, actual `Order` created (status: `pending`, payment: `online`), `PaymentAttempt` updated to `paid`
5. **On Failure:** `PaymentAttempt` updated to `failed` with reason, visible in order history

**Screens:**
- Home (product grid with categories)
- Product Detail
- Cart with price summary
- Orders list with date filter
- Order Detail with delivery tracking
- Search
- Profile

### 2. VegetableBoyDelivery (Delivery Partner App)

React Native mobile app for delivery personnel to view assigned orders and mark deliveries.

**Key Features:**
- Login with admin-assigned credentials
- View today's assigned orders
- Order detail with items and delivery address
- Mark order as delivered
- No payment handling — delivery partner only delivers

**Screens:**
- Login
- Home (order list)
- Order Detail
- Profile

### 3. vegetableboy-admin (Admin Dashboard)

Next.js web dashboard for administrators to manage products, users, zones, delivery persons, orders, and monitor payments.

**Key Features:**
- Dashboard with order stats, cash/online totals, delivery person performance
- Orders management with bulk assignment
- Failed Payments monitoring page
- Product management with price setting (250g / 500g / 1kg)
- Zone management with area coverage
- Delivery person management with active/inactive toggle
- User management
- Reports

**Admin Pages:**
- `/dashboard` — Overview stats and recent orders
- `/orders` — Consolidated, per-person, and delivery status views
- `/orders/price` — Set daily prices
- `/failed-payments` — Track failed Razorpay attempts
- `/products` — Product CRUD + availability toggle
- `/users` — Customer management
- `/delivery` — Delivery person management
- `/zones` — Zone management
- `/reports` — Analytics

---

## Database Schema (Prisma + MongoDB)

**Core Models:**
- `User` — Customers with zone, block, building, flat
- `DeliveryPerson` — Delivery partners with active status
- `Product` — Vegetables with prices per variant (price250, price500, price1kg)
- `Order` — Orders with status (pending, delivered, failed), payment type (cash, online)
- `OrderItem` — Line items with variant and quantity
- `Zone` — Delivery zones
- `ZoneDeliveryPerson` — Many-to-many zone-to-person mapping
- `PaymentAttempt` — Razorpay session tracking (created | paid | failed)
- `Admin` — Dashboard login credentials

**PaymentAttempt Fields:**
- `userId`, `zoneId`, `total`, `deliveryCharge`
- `itemsJson` — Cart snapshot at attempt time
- `status` — created | paid | failed
- `razorpayOrderId` (unique), `razorpayPaymentId`, `razorpaySignature`
- `failureReason`, `orderId`

---

## API Routes (Admin Backend)

### Authentication
- `POST /api/auth/login` — Admin login (cookie-based)
- `POST /api/auth/logout` — Admin logout
- `GET /api/auth/me` — Admin session check
- `POST /api/auth/seed` — Create initial admin

- `POST /api/auth/user-login` — Customer mobile login (Bearer token)
- `GET /api/auth/user-me` — Customer profile
- `PUT /api/auth/user-me` — Update customer profile
- `POST /api/auth/delivery-login` — Delivery partner login

### Products
- `GET /api/products` — List products
- `POST /api/products` — Create product
- `PUT /api/products/:id` — Update product
- `DELETE /api/products/:id` — Delete product
- `PATCH /api/products/:id/toggle` — Toggle availability

### Users
- `GET /api/users` — List users
- `POST /api/users` — Create user
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user
- `PATCH /api/users/:id/toggle` — Toggle user active status

### Zones
- `GET /api/zones` — List zones
- `POST /api/zones` — Create zone
- `PUT /api/zones/:id` — Update zone
- `DELETE /api/zones/:id` — Delete zone

### Delivery Persons
- `GET /api/delivery-persons` — List delivery persons
- `POST /api/delivery-persons` — Create delivery person
- `PUT /api/delivery-persons/:id` — Update delivery person
- `DELETE /api/delivery-persons/:id` — Delete delivery person
- `PATCH /api/delivery-persons/:id/toggle` — Toggle active status

### Orders
- `GET /api/orders` — List all orders (admin)
- `POST /api/orders` — Create order (admin)
- `PUT /api/orders/:id` — Update order / reassign delivery person
- `DELETE /api/orders/:id` — Delete order

### Customer APIs (Mobile)
- `GET /api/user/orders` — Customer order history (includes failed payments)
- `POST /api/user/orders` — Place order (legacy COD flow)
- `POST /api/user/payments/order` — Create Razorpay order
- `POST /api/user/payments/verify` — Verify payment + create order
- `POST /api/user/payments/failure` — Record payment failure

### Delivery APIs (Mobile)
- `GET /api/delivery/orders` — Assigned orders for delivery person
- `GET /api/delivery/orders/:id` — Order detail for delivery
- `PUT /api/delivery/orders/:id` — Mark delivered
- `GET /api/delivery/self` — Delivery person profile

### Dashboard & Reports
- `GET /api/dashboard` — Dashboard statistics
- `GET /api/failed-payments` — Failed payment attempts (admin)
- `GET /api/reports` — Reports data
- `GET /api/prices` — Price data
- `POST /api/prices` — Save prices

---

## Environment Variables

### vegetableboy-admin/.env

```env
DATABASE_URL="mongodb+srv://.../vegetableboy?retryWrites=true&w=majority"
JWT_SECRET="your-jwt-secret"
ADMIN_SEED_KEY="your-seed-key"
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your-key-secret"
```

### User App Config

`VegetableBoy/src/services/config.js`:
```js
export const RAZORPAY_KEY_ID = 'rzp_test_...';
```

> Note: Update with production Razorpay keys before release.

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- Android Studio (for emulator / physical device)
- Razorpay account (test keys for development)

### 1. Clone Repository

```bash
git clone https://github.com/MotoBwi/VegetableBoy.git
cd VegetableBoy
```

### 2. Admin Dashboard Setup

```bash
cd vegetableboy-admin
npm install
cp .env.example .env
# Update .env with your MongoDB URI, JWT secret, and Razorpay keys
npx prisma generate
npm run dev
```

Admin dashboard runs at `http://localhost:3000`

### 3. Customer App Setup

```bash
cd ../VegetableBoy
npm install
cd android
# For Windows: gradlew.bat clean
./gradlew clean
cd ..
npx react-native run-android
```

> Requires Android emulator or connected device.
> Update `src/services/api.js` `BASE_URL` if backend is not on `10.0.2.2:3000`.

### 4. Delivery App Setup

```bash
cd ../VegetableBoyDelivery
npm install
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## Razorpay Payment Integration

**Signature Verification:**
```js
const crypto = require('crypto');
const body = `${orderId}|${paymentId}`;
const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
```

**Test UPI IDs:**
- `success@razorpay` — Always succeeds
- `failure@razorpay` — Always fails

**Payment Status Flow:**
```
Cart Items
   |
   v
PaymentAttempt (status: created) + Razorpay Order
   |
   |-- Razorpay Checkout Success --|
   v                                v
verifyPayment()              recordFailure()
   |                                |
   v                                v
Order (pending, online)    PaymentAttempt (failed)
   |                                |
   v                                v
Admin Orders               User Order History
```

---

## Branch Strategy

- `main` — Production-ready stable code
- `Dev` — Active development branch (default for PRs)

---

## Key Design Decisions

1. **Deferred Order Creation:** Actual `Order` records are only created after successful Razorpay payment verification. Failed payments are tracked separately via `PaymentAttempt`.

2. **UPI-Only Checkout:** The Razorpay checkout is configured to show only UPI options (detected UPI apps, enter UPI ID, QR scan).

3. **Auto-Assignment:** Orders are automatically assigned to an active delivery person in the customer's zone at creation time.

4. **Failed Payment Visibility:** Failed payment attempts appear in the user's order history with a "Payment Failed" status so users know their order was not placed.

5. **No Amounts in Delivery App:** Delivery partners only see items and addresses, never prices or payment amounts.

---

## License

Private — All rights reserved.

---

## Support

For issues or feature requests, please open a GitHub issue or contact the development team.

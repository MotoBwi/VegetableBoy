# Graph Report - .  (2026-05-01)

## Corpus Check
- Corpus is ~32,239 words - fits in a single context window. You may not need a graph.

## Summary
- 320 nodes · 353 edges · 44 communities detected
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin API Routes|Admin API Routes]]
- [[_COMMUNITY_Admin Core API|Admin Core API]]
- [[_COMMUNITY_React Native Docs|React Native Docs]]
- [[_COMMUNITY_Delivery App Flow|Delivery App Flow]]
- [[_COMMUNITY_Order Management|Order Management]]
- [[_COMMUNITY_Authentication System|Authentication System]]
- [[_COMMUNITY_Resource ID Routes|Resource ID Routes]]
- [[_COMMUNITY_Next.js Project Docs|Next.js Project Docs]]
- [[_COMMUNITY_Graphify Tooling|Graphify Tooling]]
- [[_COMMUNITY_Customer App Navigation|Customer App Navigation]]
- [[_COMMUNITY_Delivery Android Bootstrap|Delivery Android Bootstrap]]
- [[_COMMUNITY_Login & Rate Limiting|Login & Rate Limiting]]
- [[_COMMUNITY_Customer Android Bootstrap|Customer Android Bootstrap]]
- [[_COMMUNITY_Delivery iOS Bootstrap|Delivery iOS Bootstrap]]
- [[_COMMUNITY_Database Seeding|Database Seeding]]
- [[_COMMUNITY_Request Middleware|Request Middleware]]
- [[_COMMUNITY_Customer iOS Bootstrap|Customer iOS Bootstrap]]
- [[_COMMUNITY_Database Infrastructure|Database Infrastructure]]
- [[_COMMUNITY_Delivery App Entry|Delivery App Entry]]
- [[_COMMUNITY_Delivery iOS Tests|Delivery iOS Tests]]
- [[_COMMUNITY_Delivery Android Entry|Delivery Android Entry]]
- [[_COMMUNITY_Customer App Entry|Customer App Entry]]
- [[_COMMUNITY_Customer iOS Tests|Customer iOS Tests]]
- [[_COMMUNITY_Customer Android Entry|Customer Android Entry]]
- [[_COMMUNITY_Rate Limiting Config|Rate Limiting Config]]
- [[_COMMUNITY_Android Launcher Icons|Android Launcher Icons]]
- [[_COMMUNITY_Navigation Components|Navigation Components]]
- [[_COMMUNITY_Home Screens|Home Screens]]
- [[_COMMUNITY_Login Screens|Login Screens]]
- [[_COMMUNITY_Launcher Icons XHDPI|Launcher Icons XHDPI]]
- [[_COMMUNITY_Launcher Icons MDPI|Launcher Icons MDPI]]
- [[_COMMUNITY_Launcher Icons HDPI|Launcher Icons HDPI]]
- [[_COMMUNITY_Launcher Icons XXHDPI|Launcher Icons XXHDPI]]
- [[_COMMUNITY_Launcher Icons XXXHDPI|Launcher Icons XXXHDPI]]
- [[_COMMUNITY_Framework Logos|Framework Logos]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]

## God Nodes (most connected - your core abstractions)
1. `React Native` - 21 edges
2. `Prisma Client Singleton` - 16 edges
3. `verifyToken()` - 15 edges
4. `getTokenFromCookie()` - 14 edges
5. `Verify JWT Token` - 10 edges
6. `Get Token From Cookie` - 10 edges
7. `requireAuth()` - 9 edges
8. `requireAuth()` - 8 edges
9. `requireAuth()` - 8 edges
10. `Home Screen` - 8 edges

## Surprising Connections (you probably didn't know these)
- `VegetableBoyTests` --conceptually_related_to--> `App Root`  [INFERRED]
  VegetableBoy/ios/VegetableBoyTests/VegetableBoyTests.m → VegetableBoyDelivery/App.js
- `App test` --conceptually_related_to--> `App Root`  [INFERRED]
  VegetableBoy/__tests__/App.test.tsx → VegetableBoyDelivery/App.js
- `JWT Require Auth` --semantically_similar_to--> `requireAuth()`  [INFERRED] [semantically similar]
  vegetableboy-admin/src/lib/jwt.js → vegetableboy-admin/src/app/api/orders/route.js
- `App Root` --calls--> `AppNavigator`  [EXTRACTED]
  VegetableBoyDelivery/App.js → VegetableBoy/src/navigation/AppNavigator.js
- `Home Screen` --semantically_similar_to--> `Summary Screen`  [INFERRED] [semantically similar]
  VegetableBoyDelivery/src/screens/home/HomeScreen.js → VegetableBoyDelivery/src/screens/delivery/SummaryScreen.js

## Hyperedges (group relationships)
- **Delivery Payment Flow** — orderdetailscreen_orderdetailscreen, paymentscreen_paymentscreen, qrscreen_qrscreen [INFERRED 0.85]
- **Order State Management** — homescreen_homescreen, orderdetailscreen_orderdetailscreen, paymentscreen_paymentscreen, qrscreen_qrscreen [INFERRED 0.80]
- **Duplicated Auth Middleware** — jwt_requireauth, zones_id_route_requireauth, dashboard_route_requireauth, users_route_requireauth, users_id_route_requireauth, users_id_toggle_route_requireauth, orders_route_requireauth, orders_id_route_requireauth, reports_route_requireauth [INFERRED 0.85]
- **API Client Abstraction** — api_api, api_authapi, api_orderapi, api_priceapi, api_reportapi [EXTRACTED 1.00]
- **Authenticated Admin Endpoints** — dashboard_route_get, users_route_get, users_route_post, users_id_route_put, users_id_route_delete, users_id_toggle_route_patch, orders_route_get, orders_route_post, orders_id_route_put, orders_id_route_delete, reports_route_get, zones_id_route_put, zones_id_route_delete [EXTRACTED 1.00]
- **Rate Limiting System** — apiratelimit_checkapiratelimit, apiratelimit_requestmap, apiratelimit_max_req, apiratelimit_window_ms [INFERRED 0.80]
- **Cross-Platform Native Entry Points** — main_main, appdelegate_appdelegate, mainactivity_mainactivity, mainapplication_mainapplication [INFERRED 0.80]
- **App Navigation Flow Screens** — loginscreen, homescreen, productdetailscreen, cartscreen, ordersscreen, orderdetailscreen [EXTRACTED 1.00]
- **Cart State Sharing Chain** — homescreen, productdetailscreen, cartscreen [INFERRED 0.85]
- **Development Toolchain** — readme_metro, readme_npm, readme_yarn, readme_android_studio, readme_xcode [INFERRED 0.80]
- **Cross-Platform Targets** — readme_android, readme_ios, readme_android_emulator, readme_ios_simulator [INFERRED 0.80]
- **Next.js Project Stack** — readme_next_js, readme_create_next_app, readme_next_font, readme_geist, readme_vercel, readme_app_page_js [INFERRED 0.85]
- **MySQL Deployment Stack** — docker_compose_mysql, docker_compose_mysql_8_0, docker_compose_mysql_data, docker_compose_vegetableboy [EXTRACTED 1.00]
- **graphify Tool Commands** — claude_graphify, claude_graphify_query, claude_graphify_path, claude_graphify_explain, claude_graphify_update [EXTRACTED 1.00]
- **React Native Learning Resources** — readme_react_native_website, readme_getting_started_docs, readme_learn_the_basics, readme_react_native_blog, readme_facebook_react_native [EXTRACTED 1.00]
- **React Native Development Workflow** — readme_react_native, readme_metro, readme_app_tsx, readme_android, readme_ios [INFERRED 0.80]
- **Square Launcher Icon Density Set** — ic_launcher_vegetableboydelivery_mdpi, ic_launcher_vegetableboydelivery_hdpi, ic_launcher_vegetableboydelivery_xhdpi, ic_launcher_vegetableboydelivery_xxhdpi, ic_launcher_vegetableboydelivery_xxxhdpi [EXTRACTED 1.00]
- **Round Launcher Icon Density Set** — ic_launcher_round_vegetableboydelivery_mdpi, ic_launcher_round_vegetableboydelivery_hdpi, ic_launcher_round_vegetableboydelivery_xhdpi, ic_launcher_round_vegetableboydelivery_xxhdpi, ic_launcher_round_vegetableboydelivery_xxxhdpi [EXTRACTED 1.00]
- **VegetableBoyDelivery Complete Launcher Icon Set** — ic_launcher_vegetableboydelivery_mdpi, ic_launcher_vegetableboydelivery_hdpi, ic_launcher_vegetableboydelivery_xhdpi, ic_launcher_vegetableboydelivery_xxhdpi, ic_launcher_vegetableboydelivery_xxxhdpi, ic_launcher_round_vegetableboydelivery_mdpi, ic_launcher_round_vegetableboydelivery_hdpi, ic_launcher_round_vegetableboydelivery_xhdpi, ic_launcher_round_vegetableboydelivery_xxhdpi, ic_launcher_round_vegetableboydelivery_xxxhdpi [INFERRED 0.85]
- **Admin Dashboard UI Icons** — file_icon, globe_icon, window_icon [INFERRED 0.70]
- **Android App Launcher Icons** — androidmanifest_application, ic_launcher_icon, ic_launcher_round_icon [INFERRED 0.90]

## Communities

### Community 0 - "Admin API Routes"
Cohesion: 0.12
Nodes (19): GET(), POST(), requireAuth(), getTokenFromCookie(), requireAuth(), verifyToken(), POST(), GET() (+11 more)

### Community 1 - "Admin Core API"
Cohesion: 0.15
Nodes (26): Auth API Client, Logout Handler, Get Current Admin Handler, GET(), requireAuth(), Get Token From Cookie, JWT Require Auth, Verify JWT Token (+18 more)

### Community 2 - "React Native Docs"
Cohesion: 0.11
Nodes (22): Android, Android Emulator, Android Studio, App.tsx, Developer Menu, React Native Environment Setup, @facebook/react-native, Getting Started (+14 more)

### Community 3 - "Delivery App Flow"
Cohesion: 0.15
Nodes (19): App Root, App test, App Renders Test, iOS App Delegate, App Navigator, Home Screen, Initial Orders Mock Data, Status Config (+11 more)

### Community 4 - "Order Management"
Cohesion: 0.19
Nodes (10): API Client Base, Order API Client, Price API Client, Report API Client, OrdersPage(), Price Setting Page, GET(), POST() (+2 more)

### Community 5 - "Authentication System"
Cohesion: 0.24
Nodes (9): Login Handler, Constant-Time String Compare, Get Request Fingerprint, In-Memory Rate Limiter Check, Seed Admin Handler, Sign JWT Token, LoginPage(), Check Rate Limit (+1 more)

### Community 6 - "Resource ID Routes"
Cohesion: 0.61
Nodes (3): DELETE(), PUT(), requireAuth()

### Community 7 - "Next.js Project Docs"
Cohesion: 0.25
Nodes (8): Next.js (Agents Context), node_modules/next/dist/docs, app/page.js, create-next-app, Geist, next/font, Next.js, Vercel

### Community 8 - "Graphify Tooling"
Cohesion: 0.29
Nodes (8): GRAPH_REPORT.md, graphify, graphify explain, graphify-out/, graphify path, graphify query, graphify update, wiki/index.md

### Community 9 - "Customer App Navigation"
Cohesion: 0.62
Nodes (7): AppNavigator, CartScreen, HomeScreen, LoginScreen, OrderDetailScreen, OrdersScreen, ProductDetailScreen

### Community 10 - "Delivery Android Bootstrap"
Cohesion: 0.33
Nodes (1): MainApplication

### Community 11 - "Login & Rate Limiting"
Cohesion: 0.4
Nodes (4): signToken(), checkRateLimit(), clearRateLimit(), POST()

### Community 12 - "Customer Android Bootstrap"
Cohesion: 0.33
Nodes (1): MainApplication

### Community 13 - "Delivery iOS Bootstrap"
Cohesion: 0.4
Nodes (4): AppDelegate, -applicationdidFinishLaunchingWithOptions, -bundleURL, -sourceURLForBridge

### Community 14 - "Database Seeding"
Cohesion: 0.7
Nodes (4): constantTimeCompare(), getFingerprint(), isRateLimited(), POST()

### Community 15 - "Request Middleware"
Cohesion: 0.5
Nodes (3): checkApiRateLimit(), getClientIp(), middleware()

### Community 16 - "Customer iOS Bootstrap"
Cohesion: 0.4
Nodes (4): AppDelegate, -applicationdidFinishLaunchingWithOptions, -bundleURL, -sourceURLForBridge

### Community 17 - "Database Infrastructure"
Cohesion: 0.4
Nodes (5): MySQL Service, mysql:8.0 Image, mysql_data Volume, vegetableboy Database, vegetableboy-mysql Container

### Community 18 - "Delivery App Entry"
Cohesion: 0.5
Nodes (1): App()

### Community 19 - "Delivery iOS Tests"
Cohesion: 0.5
Nodes (3): VegetableBoyDeliveryTests, -findSubviewInViewmatching, -testRendersWelcomeScreen

### Community 20 - "Delivery Android Entry"
Cohesion: 0.5
Nodes (1): MainActivity

### Community 21 - "Customer App Entry"
Cohesion: 0.5
Nodes (1): App()

### Community 22 - "Customer iOS Tests"
Cohesion: 0.5
Nodes (3): VegetableBoyTests, -findSubviewInViewmatching, -testRendersWelcomeScreen

### Community 23 - "Customer Android Entry"
Cohesion: 0.5
Nodes (1): MainActivity

### Community 24 - "Rate Limiting Config"
Cohesion: 0.5
Nodes (4): checkApiRateLimit, MAX_REQ, requestMap, WINDOW_MS

### Community 25 - "Android Launcher Icons"
Cohesion: 0.67
Nodes (4): AndroidManifest Application, VegetableBoy App, Android Standard Launcher Icon, Android Round Launcher Icon

### Community 26 - "Navigation Components"
Cohesion: 0.67
Nodes (1): AppNavigator()

### Community 27 - "Home Screens"
Cohesion: 0.67
Nodes (1): HomeScreen()

### Community 28 - "Login Screens"
Cohesion: 0.67
Nodes (1): LoginScreen()

### Community 48 - "Launcher Icons XHDPI"
Cohesion: 1.0
Nodes (2): VegetableBoyDelivery Round Launcher Icon (XHDPI), VegetableBoyDelivery Launcher Icon (XHDPI)

### Community 49 - "Launcher Icons MDPI"
Cohesion: 1.0
Nodes (2): VegetableBoyDelivery Round Launcher Icon (MDPI), VegetableBoyDelivery Launcher Icon (MDPI)

### Community 50 - "Launcher Icons HDPI"
Cohesion: 1.0
Nodes (2): VegetableBoyDelivery Round Launcher Icon (HDPI), VegetableBoyDelivery Launcher Icon (HDPI)

### Community 51 - "Launcher Icons XXHDPI"
Cohesion: 1.0
Nodes (2): VegetableBoyDelivery Round Launcher Icon (XXHDPI), VegetableBoyDelivery Launcher Icon (XXHDPI)

### Community 52 - "Launcher Icons XXXHDPI"
Cohesion: 1.0
Nodes (2): VegetableBoyDelivery Round Launcher Icon (XXXHDPI), VegetableBoyDelivery Launcher Icon (XXXHDPI)

### Community 53 - "Framework Logos"
Cohesion: 1.0
Nodes (2): Next.js Logo, Vercel Logo

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (1): Section Component

### Community 77 - "Community 77"
Cohesion: 1.0
Nodes (1): Theme Colors

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (1): iOS UI Test

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (1): Jest configuration

### Community 80 - "Community 80"
Cohesion: 1.0
Nodes (1): Metro configuration

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (1): Babel configuration

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (1): File Icon

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (1): Globe Icon

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (1): Window Icon

## Knowledge Gaps
- **74 isolated node(s):** `-applicationdidFinishLaunchingWithOptions`, `-sourceURLForBridge`, `-bundleURL`, `-findSubviewInViewmatching`, `-testRendersWelcomeScreen` (+69 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Delivery Android Bootstrap`** (6 nodes): `MainApplication.kt`, `getJSMainModuleName()`, `getPackages()`, `getUseDeveloperSupport()`, `MainApplication`, `.onCreate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Customer Android Bootstrap`** (6 nodes): `MainApplication.kt`, `getJSMainModuleName()`, `getPackages()`, `getUseDeveloperSupport()`, `MainApplication`, `.onCreate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Delivery App Entry`** (4 nodes): `App()`, `App.js`, `Section()`, `App.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Delivery Android Entry`** (4 nodes): `MainActivity.kt`, `MainActivity`, `.createReactActivityDelegate()`, `.getMainComponentName()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Customer App Entry`** (4 nodes): `App()`, `App.js`, `Section()`, `App.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Customer Android Entry`** (4 nodes): `MainActivity.kt`, `MainActivity`, `.createReactActivityDelegate()`, `.getMainComponentName()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Navigation Components`** (3 nodes): `AppNavigator()`, `AppNavigator.js`, `AppNavigator.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Home Screens`** (3 nodes): `HomeScreen()`, `HomeScreen.js`, `HomeScreen.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Login Screens`** (3 nodes): `LoginScreen()`, `LoginScreen.js`, `LoginScreen.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Launcher Icons XHDPI`** (2 nodes): `VegetableBoyDelivery Round Launcher Icon (XHDPI)`, `VegetableBoyDelivery Launcher Icon (XHDPI)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Launcher Icons MDPI`** (2 nodes): `VegetableBoyDelivery Round Launcher Icon (MDPI)`, `VegetableBoyDelivery Launcher Icon (MDPI)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Launcher Icons HDPI`** (2 nodes): `VegetableBoyDelivery Round Launcher Icon (HDPI)`, `VegetableBoyDelivery Launcher Icon (HDPI)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Launcher Icons XXHDPI`** (2 nodes): `VegetableBoyDelivery Round Launcher Icon (XXHDPI)`, `VegetableBoyDelivery Launcher Icon (XXHDPI)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Launcher Icons XXXHDPI`** (2 nodes): `VegetableBoyDelivery Round Launcher Icon (XXXHDPI)`, `VegetableBoyDelivery Launcher Icon (XXXHDPI)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Framework Logos`** (2 nodes): `Next.js Logo`, `Vercel Logo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (1 nodes): `Section Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (1 nodes): `Theme Colors`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (1 nodes): `iOS UI Test`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (1 nodes): `Jest configuration`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (1 nodes): `Metro configuration`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (1 nodes): `Babel configuration`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (1 nodes): `File Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (1 nodes): `Globe Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (1 nodes): `Window Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `verifyToken()` connect `Admin API Routes` to `Admin Core API`, `Order Management`, `Resource ID Routes`, `Request Middleware`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `getTokenFromCookie()` connect `Admin API Routes` to `Admin Core API`, `Order Management`, `Resource ID Routes`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `Prisma Client Singleton` connect `Admin Core API` to `Order Management`, `Authentication System`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `verifyToken()` (e.g. with `middleware()` and `requireAuth()`) actually correct?**
  _`verifyToken()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `getTokenFromCookie()` (e.g. with `requireAuth()` and `requireAuth()`) actually correct?**
  _`getTokenFromCookie()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `-applicationdidFinishLaunchingWithOptions`, `-sourceURLForBridge`, `-bundleURL` to the rest of the system?**
  _74 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
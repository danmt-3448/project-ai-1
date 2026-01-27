# API Testing Guide

Hướng dẫn test tất cả API endpoints của Mini Storefront.

---

## 🔧 Setup

### Start Backend Server
```bash
yarn dev:backend
# Backend running at http://localhost:3001
```

### Tools
- **curl** (command line)
- **HTTPie** (recommended): `brew install httpie`
- **Postman** hoặc **Insomnia** (GUI)

---

## 📋 Public Endpoints

### 1. GET /api/categories

List tất cả categories.

```bash
curl http://localhost:3001/api/categories
```

**Expected Response**:
```json
[
  {
    "id": 1,
    "name": "Áo",
    "slug": "ao"
  },
  {
    "id": 2,
    "name": "Quần",
    "slug": "quan"
  },
  {
    "id": 3,
    "name": "Phụ kiện",
    "slug": "phu-kien"
  }
]
```

---

### 2. GET /api/products

List products với pagination, search và filter.

**Basic request**:
```bash
curl http://localhost:3001/api/products
```

**With pagination**:
```bash
curl "http://localhost:3001/api/products?page=1&limit=5"
```

**With category filter**:
```bash
curl "http://localhost:3001/api/products?category=ao"
```

**With search**:
```bash
curl "http://localhost:3001/api/products?search=thun"
```

**Combined**:
```bash
curl "http://localhost:3001/api/products?category=ao&search=thun&page=1&limit=10"
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Áo Thun Cơ Bản",
      "slug": "ao-thun-co-ban",
      "description": "Áo thun cotton 100%",
      "price": 150000,
      "inventory": 50,
      "images": ["https://via.placeholder.com/400"],
      "category": {
        "id": 1,
        "name": "Áo",
        "slug": "ao"
      }
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### 3. GET /api/products/:slug

Get chi tiết product by slug.

```bash
curl http://localhost:3001/api/products/ao-thun-co-ban
```

**Expected Response**:
```json
{
  "id": 1,
  "name": "Áo Thun Cơ Bản",
  "slug": "ao-thun-co-ban",
  "description": "Áo thun cotton 100%, thoáng mát",
  "price": 150000,
  "inventory": 50,
  "published": true,
  "images": ["https://via.placeholder.com/400"],
  "category": {
    "id": 1,
    "name": "Áo",
    "slug": "ao"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Test not found**:
```bash
curl http://localhost:3001/api/products/invalid-slug
# Expected: 404 Not Found
```

---

### 4. GET /api/categories/:slug/products

Get tất cả products trong một category.

```bash
curl http://localhost:3001/api/categories/ao/products
```

**Expected Response**:
```json
{
  "category": {
    "id": 1,
    "name": "Áo",
    "slug": "ao"
  },
  "products": [
    {
      "id": 1,
      "name": "Áo Thun Cơ Bản",
      "slug": "ao-thun-co-ban",
      "price": 150000,
      "inventory": 50,
      "images": ["..."],
      "category": { "id": 1, "name": "Áo", "slug": "ao" }
    }
  ]
}
```

---

### 5. POST /api/checkout

Tạo order mới (transactional với inventory check).

**Success case**:
```bash
curl -X POST http://localhost:3001/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "buyer": {
      "name": "Nguyen Van A",
      "email": "nguyenvana@example.com",
      "address": "123 Nguyen Trai, Ha Noi"
    },
    "items": [
      {
        "productId": "cm...",
        "quantity": 2
      },
      {
        "productId": "cm...",
        "quantity": 1
      }
    ]
  }'
```

**Expected Response**:
```json
{
  "orderId": 1,
  "status": "pending",
  "total": 450000,
  "message": "Order created successfully"
}
```

**Insufficient inventory**:
```bash
curl -X POST http://localhost:3001/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "buyer": {
      "name": "Test User",
      "email": "test@example.com",
      "address": "Test Address 123 Main St"
    },
    "items": [
      {
        "productId": "cm...",
        "quantity": 9999
      }
    ]
  }'
```

**Expected Response**:
```json
{
  "error": "Insufficient inventory",
  "message": "Insufficient inventory for product \"Áo Thun Cơ Bản\". Available: 50, requested: 9999"
}
```

**Simulate failure**:
```bash
curl -X POST http://localhost:3001/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "buyer": {
      "name": "Test User",
      "email": "test@example.com",
      "address": "Test Address 123"
    },
    "items": [{"productId": "cm...", "quantity": 1}],
    "simulateFail": true
  }'
```

**Expected Response**:
```json
{
  "error": "Simulated checkout failure",
  "message": "This is a test failure"
}
```

---

### 6. GET /api/orders/:id

Get order detail by ID.

```bash
curl http://localhost:3001/api/orders/1
```

**Expected Response**:
```json
{
  "id": 1,
  "buyerName": "Nguyen Van A",
  "buyerEmail": "nguyenvana@example.com",
  "address": "123 Nguyen Trai, Ha Noi",
  "total": 450000,
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "items": [
    {
      "id": 1,
      "productId": 1,
      "name": "Áo Thun Cơ Bản",
      "price": 150000,
      "quantity": 2,
      "product": {
        "slug": "ao-thun-co-ban",
        "images": ["..."]
      }
    }
  ]
}
```

---

## 🔐 Admin Endpoints

Tất cả admin endpoints yêu cầu JWT token.

### 1. POST /api/admin/login

Login để lấy JWT token.

```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin"
  }
}
```

**Save token for next requests**:
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Invalid credentials**:
```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "wrong"
  }'
# Expected: 401 Invalid credentials
```

---

### 2. GET /api/admin/products

List tất cả products (bao gồm unpublished).

```bash
curl http://localhost:3001/api/admin/products \
  -H "Authorization: Bearer $TOKEN"
```

**With pagination and search**:
```bash
curl "http://localhost:3001/api/admin/products?page=1&limit=10&search=thun" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Áo Thun Cơ Bản",
      "slug": "ao-thun-co-ban",
      "price": 150000,
      "inventory": 50,
      "published": true,
      "category": { "id": 1, "name": "Áo", "slug": "ao" },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

### 3. POST /api/admin/products/create

Tạo product mới.

```bash
curl -X POST http://localhost:3001/api/admin/products/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Áo Polo Nam",
    "slug": "ao-polo-nam",
    "description": "Áo polo cao cấp",
    "price": 250000,
    "inventory": 30,
    "categoryId": 1,
    "images": ["https://via.placeholder.com/400"],
    "published": true
  }'
```

**Expected Response**:
```json
{
  "id": 11,
  "name": "Áo Polo Nam",
  "slug": "ao-polo-nam",
  "price": 250000,
  "inventory": 30,
  "published": true,
  "category": { "id": 1, "name": "Áo", "slug": "ao" }
}
```

**Duplicate slug error**:
```bash
# Try creating with existing slug
curl -X POST http://localhost:3001/api/admin/products/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "slug": "ao-thun-co-ban",
    "description": "Test",
    "price": 100000,
    "inventory": 10,
    "categoryId": 1
  }'
# Expected: 400 Slug already exists
```

---

### 4. GET /api/admin/products/:id

Get product detail for editing.

```bash
curl http://localhost:3001/api/admin/products/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

### 5. PUT /api/admin/products/:id

Update product.

**Update price and inventory**:
```bash
curl -X PUT http://localhost:3001/api/admin/products/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 180000,
    "inventory": 45
  }'
```

**Publish/unpublish**:
```bash
curl -X PUT http://localhost:3001/api/admin/products/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "published": false
  }'
```

**Update multiple fields**:
```bash
curl -X PUT http://localhost:3001/api/admin/products/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Áo Thun Cơ Bản (Updated)",
    "description": "New description",
    "price": 200000,
    "inventory": 100,
    "published": true
  }'
```

---

### 6. DELETE /api/admin/products/:id

Delete product.

```bash
curl -X DELETE http://localhost:3001/api/admin/products/11 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response**:
```json
{
  "message": "Product deleted successfully"
}
```

---

### 7. GET /api/admin/orders

List tất cả orders.

```bash
curl http://localhost:3001/api/admin/orders \
  -H "Authorization: Bearer $TOKEN"
```

**With status filter**:
```bash
curl "http://localhost:3001/api/admin/orders?status=pending" \
  -H "Authorization: Bearer $TOKEN"
```

**With pagination**:
```bash
curl "http://localhost:3001/api/admin/orders?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": 1,
      "buyerName": "Nguyen Van A",
      "buyerEmail": "nguyenvana@example.com",
      "total": 450000,
      "status": "pending",
      "createdAt": "...",
      "items": [...]
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

## 🧪 Test Scenarios

### Scenario 1: User Checkout Flow

```bash
# 1. Browse products
curl http://localhost:3001/api/products

# 2. Get product detail
curl http://localhost:3001/api/products/ao-thun-co-ban

# 3. Checkout
curl -X POST http://localhost:3001/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "buyerName": "Test User",
    "buyerEmail": "test@example.com",
    "address": "123 Test Street",
    "items": [{"productId": 1, "quantity": 2}]
  }'

# 4. View order
curl http://localhost:3001/api/orders/1
```

---

### Scenario 2: Admin Product Management

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

# 2. List products
curl http://localhost:3001/api/admin/products \
  -H "Authorization: Bearer $TOKEN"

# 3. Create new product
curl -X POST http://localhost:3001/api/admin/products/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "slug": "test-product",
    "description": "Test",
    "price": 100000,
    "inventory": 10,
    "categoryId": 1,
    "published": false
  }'

# 4. Update product
curl -X PUT http://localhost:3001/api/admin/products/11 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"published": true}'

# 5. Delete product
curl -X DELETE http://localhost:3001/api/admin/products/11 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🛡️ Security Tests

### Test unauthorized access

```bash
# Try admin endpoint without token
curl http://localhost:3001/api/admin/products
# Expected: 401 Unauthorized

# Try with invalid token
curl http://localhost:3001/api/admin/products \
  -H "Authorization: Bearer invalid_token"
# Expected: 401 Unauthorized
```

---

## 📊 Performance Tests

### Load test checkout endpoint

```bash
# Using Apache Bench
ab -n 100 -c 10 -T 'application/json' \
  -p checkout.json \
  http://localhost:3001/api/checkout
```

**checkout.json**:
```json
{
  "buyerName": "Test",
  "buyerEmail": "test@example.com",
  "address": "Test Address",
  "items": [{"productId": 1, "quantity": 1}]
}
```

---

## 🐛 Error Handling Tests

### Validation errors

```bash
# Missing required fields
curl -X POST http://localhost:3001/api/checkout \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 400 Validation failed

# Invalid email
curl -X POST http://localhost:3001/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "buyerName": "Test",
    "buyerEmail": "invalid-email",
    "address": "Test",
    "items": [{"productId": 1, "quantity": 1}]
  }'
# Expected: 400 Invalid email
```

---

## 📦 Order Status Management (Sprint 6)

### 1. PUT /api/admin/orders/:id/status

Update order status with audit trail and inventory management.

**Authentication**: Required (Bearer token)

**Allowed Transitions**:
- PENDING → PROCESSING
- PROCESSING → SHIPPED
- SHIPPED → DELIVERED
- PENDING/PROCESSING → CANCELLED

**Terminal States**: DELIVERED, CANCELLED (cannot be changed)

#### Mark Order as Processing

```bash
curl -X PUT http://localhost:3001/api/admin/orders/{ORDER_ID}/status \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PROCESSING",
    "note": "Order confirmed and ready for preparation"
  }'
```

**Expected Response**:
```json
{
  "order": {
    "id": "order-123",
    "status": "PROCESSING",
    "buyerName": "John Doe",
    "buyerEmail": "john@example.com",
    "totalPrice": 299.99,
    "updatedAt": "2026-01-22T10:30:00Z"
  }
}
```

#### Mark Order as Shipped (with tracking)

```bash
curl -X PUT http://localhost:3001/api/admin/orders/{ORDER_ID}/status \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED",
    "trackingNumber": "FDX1234567890",
    "carrier": "FedEx",
    "shipDate": "2026-01-22T14:00:00Z",
    "note": "Shipped via FedEx Express"
  }'
```

**Expected Response**:
```json
{
  "order": {
    "id": "order-123",
    "status": "SHIPPED",
    "trackingNumber": "FDX1234567890",
    "carrier": "FedEx",
    "shipDate": "2026-01-22T14:00:00Z",
    "updatedAt": "2026-01-22T14:05:00Z"
  }
}
```

#### Mark Order as Delivered

```bash
curl -X PUT http://localhost:3001/api/admin/orders/{ORDER_ID}/status \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DELIVERED",
    "deliveryDate": "2026-01-24T16:30:00Z",
    "note": "Successfully delivered to customer"
  }'
```

#### Cancel Order (with inventory restock)

```bash
curl -X PUT http://localhost:3001/api/admin/orders/{ORDER_ID}/status \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CANCELLED",
    "cancellationReason": "Customer requested cancellation",
    "shouldRestock": true,
    "note": "Order cancelled per customer request"
  }'
```

**Expected Response with Restock**:
```json
{
  "order": {
    "id": "order-123",
    "status": "CANCELLED",
    "cancellationReason": "Customer requested cancellation",
    "updatedAt": "2026-01-22T11:00:00Z"
  },
  "restocked": [
    {
      "productId": "prod-1",
      "quantity": 2
    },
    {
      "productId": "prod-2",
      "quantity": 1
    }
  ]
}
```

#### Idempotency Support

Use `Idempotency-Key` header to prevent duplicate operations:

```bash
curl -X PUT http://localhost:3001/api/admin/orders/{ORDER_ID}/status \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: unique-key-12345" \
  -d '{
    "status": "PROCESSING",
    "note": "Order confirmed"
  }'
```

#### Error Responses

**Invalid Transition** (400):
```json
{
  "error": "Invalid status transition",
  "message": "Cannot transition from DELIVERED to PROCESSING"
}
```

**Missing Required Fields** (400):
```json
{
  "error": "Validation failed",
  "details": {
    "trackingNumber": "Required when status is SHIPPED",
    "carrier": "Required when status is SHIPPED"
  }
}
```

**Concurrent Update Conflict** (409):
```json
{
  "error": "Conflict",
  "message": "Order was modified by another admin. Please refresh and try again."
}
```

**Unauthorized** (401):
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```

### 2. GET /api/admin/orders/:id/activities

Retrieve order status change history (audit trail).

**Authentication**: Required (Bearer token)

```bash
curl http://localhost:3001/api/admin/orders/{ORDER_ID}/activities \
  -H "Authorization: Bearer {YOUR_TOKEN}"
```

**Expected Response**:
```json
{
  "orderId": "order-123",
  "currentStatus": "SHIPPED",
  "activities": [
    {
      "id": "act-1",
      "fromStatus": "PENDING",
      "toStatus": "PROCESSING",
      "note": "Order confirmed and ready for preparation",
      "timestamp": "2026-01-22T10:30:00Z",
      "admin": {
        "id": "admin-1",
        "username": "admin"
      }
    },
    {
      "id": "act-2",
      "fromStatus": "PROCESSING",
      "toStatus": "SHIPPED",
      "note": "Shipped via FedEx Express",
      "timestamp": "2026-01-22T14:05:00Z",
      "admin": {
        "id": "admin-1",
        "username": "admin"
      }
    }
  ]
}
```

**Empty History** (new order):
```json
{
  "orderId": "order-456",
  "currentStatus": "PENDING",
  "activities": []
}
```

**Order Not Found** (404):
```json
{
  "error": "Order not found"
}
```

---

## 📊 Analytics Endpoints

### 11. GET /api/admin/analytics/dashboard

Get comprehensive dashboard analytics including products, inventory, revenue, and orders statistics.

**Required**: Admin JWT token

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3001/api/admin/analytics/dashboard
```

**With date range**:
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3001/api/admin/analytics/dashboard?startDate=2026-01-01T00:00:00Z&endDate=2026-01-31T23:59:59Z"
```

**Expected Response**:
```json
{
  "products": {
    "total": 10,
    "published": 8,
    "unpublished": 2
  },
  "inventory": {
    "totalUnits": 250,
    "byCategory": [
      {
        "categoryId": "cat-1",
        "categoryName": "Áo",
        "categorySlug": "ao",
        "totalUnits": 150,
        "productCount": 5
      }
    ],
    "lowStock": [
      {
        "productId": "prod-1",
        "name": "Áo Thun",
        "slug": "ao-thun",
        "inventory": 3,
        "categoryName": "Áo"
      }
    ]
  },
  "revenue": {
    "totalRevenue": 5000000,
    "totalOrders": 25,
    "averageOrderValue": 200000,
    "byMonth": [
      {
        "month": 1,
        "year": 2026,
        "revenue": 2000000,
        "orderCount": 10
      }
    ],
    "topProducts": [
      {
        "productId": "prod-1",
        "name": "Áo Thun",
        "revenue": 1500000,
        "unitsSold": 10
      }
    ]
  },
  "orders": {
    "total": 30,
    "confirmed": 20,
    "processing": 3,
    "shipped": 2,
    "delivered": 15,
    "cancelled": 5,
    "failed": 0
  }
}
```

---

### 12. GET /api/admin/analytics/revenue

Get revenue analytics with 4 groupBy modes: order, product, month, category.

**Required**: Admin JWT token, `groupBy` parameter

**groupBy=order** (Individual orders with pagination):
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3001/api/admin/analytics/revenue?groupBy=order&limit=10&offset=0"
```

**Response**:
```json
{
  "data": [
    {
      "id": "order-123",
      "buyerName": "Nguyen Van A",
      "revenue": 300000,
      "itemCount": 2,
      "status": "DELIVERED",
      "createdAt": "2026-01-15T10:30:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "summary": {
    "totalRevenue": 5000000,
    "totalOrders": 25
  }
}
```

**groupBy=product** (Revenue per product):
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3001/api/admin/analytics/revenue?groupBy=product&sortBy=revenue&sortOrder=desc"
```

**Response**:
```json
{
  "data": [
    {
      "productId": "prod-1",
      "name": "Áo Thun Cơ Bản",
      "slug": "ao-thun-co-ban",
      "categoryName": "Áo",
      "revenue": 1500000,
      "unitsSold": 10,
      "orderCount": 8
    }
  ],
  "summary": {
    "totalRevenue": 5000000,
    "totalOrders": 25
  }
}
```

**groupBy=month** (Monthly aggregation):
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3001/api/admin/analytics/revenue?groupBy=month"
```

**Response**:
```json
{
  "data": [
    {
      "month": 1,
      "year": 2026,
      "revenue": 2000000,
      "orderCount": 10,
      "averageOrderValue": 200000
    }
  ],
  "summary": {
    "totalRevenue": 5000000,
    "totalOrders": 25
  }
}
```

**groupBy=category** (Revenue per category):
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3001/api/admin/analytics/revenue?groupBy=category"
```

**Response**:
```json
{
  "data": [
    {
      "categoryId": "cat-1",
      "name": "Áo",
      "slug": "ao",
      "revenue": 3000000,
      "unitsSold": 20,
      "orderCount": 15,
      "productCount": 5
    }
  ],
  "summary": {
    "totalRevenue": 5000000,
    "totalOrders": 25
  }
}
```

**With date range**:
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3001/api/admin/analytics/revenue?groupBy=product&startDate=2026-01-01T00:00:00Z&endDate=2026-01-31T23:59:59Z"
```

---

### 13. GET /api/admin/analytics/inventory

Get inventory analytics with 3 groupBy modes: category, product, status.

**Required**: Admin JWT token

**groupBy=category (default)** (Total units per category):
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3001/api/admin/analytics/inventory?groupBy=category"
```

**Response**:
```json
{
  "data": [
    {
      "categoryId": "cat-1",
      "name": "Áo",
      "slug": "ao",
      "totalUnits": 150,
      "productCount": 5,
      "publishedProducts": 5,
      "unpublishedProducts": 0,
      "averageInventory": 30,
      "lowStockProducts": 1
    }
  ],
  "summary": {
    "totalUnits": 250,
    "totalProducts": 10
  }
}
```

**groupBy=product** (Product-level inventory):
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3001/api/admin/analytics/inventory?groupBy=product&lowStockThreshold=5"
```

**Response**:
```json
{
  "data": [
    {
      "productId": "prod-1",
      "name": "Áo Thun Cơ Bản",
      "slug": "ao-thun-co-ban",
      "categoryName": "Áo",
      "inventory": 3,
      "published": true,
      "isLowStock": true,
      "price": 150000
    }
  ],
  "summary": {
    "totalUnits": 250,
    "totalProducts": 10
  }
}
```

**groupBy=status** (Aggregate by published status):
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3001/api/admin/analytics/inventory?groupBy=status"
```

**Response**:
```json
{
  "data": {
    "published": {
      "totalUnits": 230,
      "productCount": 8
    },
    "unpublished": {
      "totalUnits": 20,
      "productCount": 2
    }
  },
  "summary": {
    "totalUnits": 250,
    "totalProducts": 10
  }
}
```

**With includeUnpublished flag**:
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:3001/api/admin/analytics/inventory?groupBy=category&includeUnpublished=true"
```

---

**All API endpoints tested and working! ✅**


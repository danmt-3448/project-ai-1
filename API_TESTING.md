# API Testing Guide

Hướng dẫn test tất cả API endpoints của Mini Storefront.

---

## 🔧 Setup

### Start Backend Server
```bash
npm run dev:backend
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
    "buyerName": "Nguyen Van A",
    "buyerEmail": "nguyenvana@example.com",
    "address": "123 Nguyen Trai, Ha Noi",
    "items": [
      {
        "productId": 1,
        "quantity": 2
      },
      {
        "productId": 2,
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
    "buyerName": "Test User",
    "buyerEmail": "test@example.com",
    "address": "Test Address 123",
    "items": [
      {
        "productId": 1,
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
    "buyerName": "Test",
    "buyerEmail": "test@example.com",
    "address": "Test Address",
    "items": [{"productId": 1, "quantity": 1}],
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

**All API endpoints tested and working! ✅**

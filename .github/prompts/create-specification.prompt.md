# Prompt Template — Tạo Specification cho Mini Storefront (FE + BE)

## Mô tả mục tiêu prompt
Bạn là AI Specs Writer/Copilot và cần sinh ra File ĐẶC TẢ (specification) đầy đủ cho một project Mini Storefront, có cả Backend và Frontend (Next.js + TypeScript). Nội dung đặc tả cần mang đủ các mục như dưới đây, match các tiêu chí thực tế triển khai, rõ ràng/đủ chi tiết, tiêu chuẩn hóa cho Dev có thể phát triển, test, và bàn giao.

---

## Hướng dẫn sinh đặc tả

### 1. Giới thiệu & Mục tiêu dự án  
- Tên dự án  
- Mục tiêu/ngữ cảnh  
- Nêu rõ phạm vi tối thiểu (MVP) và hạn chế (constraints), công nghệ đề xuất.

### 2. Stack công nghệ (bắt buộc nêu rõ cho cả FE + BE)  
- Frontend: framework, thư viện hỗ trợ, style  
- Backend: loại API, DB, ORM, authentication  
- Deployment: Vercel/Docker, .env cần thiết  

### 3. Đối tượng sử dụng & Vai trò  
- Phân biệt rõ Guest/Buyer vs Admin (bảng quyền, đặc điểm thao tác, tính năng liên quan)

### 4. Đặc tả chức năng — Giao diện (FE)  
- List các route FE, nêu rõ path, mô tả, các component chính  
- Note hành vi UI đặc biệt (client state, validation, accessibility, caching...)

### 5. Đặc tả chức năng — API (BE)  
- Liệt kê từng endpoint (public và admin)  
- Cho method, path, request/response mẫu JSON khi cần  
- Mô tả chi tiết từng trường, validation, hành vi business logic, error cases

### 6. Data Model & DB Schema  
- Dùng Prisma schema, nêu đủ cả Product, Category, Order, AdminUser  
- Liên kết bảng, unique constraints, types, seed mẫu  

### 7. Luồng nghiệp vụ chính (ví dụ checkout: kiểm tồn kho, tạo order, rollback nếu thiếu)

### 8. Test & Acceptance Criteria  
- Gợi ý loại test cần có: unit, integration, E2E.  
- Acceptance checklist tối thiểu khi demo (ai làm được gì, trạng thái xác nhận/thành công/thất bại).

### 9. Security & Deploy Notes  
- Lưu ý hash password, JWT, bảo vệ endpoint admin, env secrets  
- Hướng dẫn triển khai Vercel, Docker nếu có

### 10. Roadmap/Kế hoạch triển khai  
- Chia sprint/scope nào làm trước, milestone nào kiểm thử

### 11. Phụ lục:  
- (OpenAPI cho API, Prisma schema, scripts seed, UI wireframe v.v.) — nếu yêu cầu thêm

---

## Template ví dụ (Tùy chỉnh theo project thực tế)

*(Bạn điền các mục ở trên theo ngữ cảnh dự án và trả về format markdown hoàn chỉnh, đầy đủ section, sẵn sàng dùng làm spec thực tế. Nếu câu hỏi thêm chi tiết, trả về phần liên quan)*

---

**Áp dụng khi gọi AI sinh đặc tả specs cho các project Next.js + TypeScript, gồm cả FE/BE, API, DB, tests, deploy.**

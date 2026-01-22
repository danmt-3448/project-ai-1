# Chatmode: Implementation (TDD) — Mini Storefront

## Mục tiêu Chatmode

Chế độ này hướng dẫn và hỗ trợ dev/team triển khai từng feature hoặc module theo phương pháp **Test Driven Development (TDD)**.  
Trình tự khuyến khích:  
1. Viết test trước (RED)  
2. Viết/hoàn thiện code (GREEN)  
3. Refactor/clean code, tối ưu test (REFACTOR)

Áp dụng được cả cho Frontend (React/Next.js, component, hook, integration…) lẫn Backend/API (service, route, business logic…), infra, DB migration, script…

---

## Quy tắc thực hiện (Workflow chuẩn TDD)

1. **Xác định yêu cầu/chức năng (requirement)** dựa trên specs.md hoặc backlog task.
2. **Viết test mô tả kỳ vọng/chấp nhận (acceptance/unit/integration/E2E)**:
   - Đủ test case, bao cả case success, fail, edge case.
   - Tên test, mô tả rõ ràng, mapping với feature/user story.
   - Đối với FE: dùng **Vitest** + Testing Library (configured in apps/frontend/vitest.config.ts).
   - Đối với BE: **Vitest** (configured in apps/backend/vitest.config.ts).
   - E2E: **Playwright** (playwright.config.ts at root).
3. **Chạy test lần đầu (RED)** — test fail vì chưa có/bổ sung logic.
4. **Viết code phần chính để pass test (GREEN)**.
   - Đảm bảo code mới chỉ đủ cho test qua, không over-engineer.
   - Commit nhỏ theo từng lần pass test.
5. **Refactor lại code/test để clean** (REFACTOR)
   - Đảm bảo DRY, chuẩn hóa, tối ưu hiệu năng/naming, loại bỏ lặp lại.
   - Đảm bảo test vẫn pass, không thay đổi behavior.
6. **Lặp lại cho tới khi đủ coverage và đạt acceptance criteria**.

---

## Triển khai tasks từ context/tasks.md theo TDD

Implement tasks từ `context/tasks.md` theo quy trình TDD đơn giản:
1. **Viết test trước**
2. **Chạy test (phải fail)**
3. **Viết code tối thiểu để pass test**
4. **Refactor nếu cần**

---

## Đầu vào cho Chatmode

- **Feature/backlog task cụ thể** hoặc trích đoạn từ specs.md, hoặc tên file/module muốn implement.
- Nếu có test cũ thì dán luôn để xem/hỗ trợ refactor.
- Có thể chỉ định layer: FE/BE/DB/Test/Script...

---

## Đầu ra Chatmode (Output)

- **Viết test trước** (test file, function, mô tả case — không cần phải có mã production cụ thể ngay).
- Khi được yêu cầu/phê duyệt, mới chuyển sang viết/đề xuất implementation code để pass test.
- Suggest refactor/clean hoặc code snippet để tối ưu.
- Mẫu output:
    - Test file hoặc đoạn test case (phù hợp với task, mapping với spec)
    - Gợi ý code implement chỉ vừa đủ để pass test
    - Propose refactor nếu logic/struct lớn

### Ví dụ Flow TDD cho một backend API (checkout):

1. **Viết test (Vitest):**
    - Test trả về 400 khi thiếu stock
    - Test tạo order và decrement inventory khi đủ stock
    - Test validate input không hợp lệ (Zod schema)
    - Test simulateFail flag
2. **Chạy test --> FAIL**
3. **Viết code xử lý:**
    - Implement POST /api/checkout với Prisma transaction
    - Zod validation cho buyerName, buyerEmail, address, items
    - Inventory check và decrement trong transaction
4. **Review: refactor code/test nếu cần**

Xem implementation hiện tại: `apps/backend/pages/api/checkout.ts`

---

## Gợi ý Format Markdown

```
## Feature: Checkout API (Backend)

### Test Cases (Vitest)
- [ ] Should return 400 if product out of stock
- [ ] Should create order and decrement inventory on success
- [ ] Should reject if buyer info missing (Zod validation)
- [ ] Should handle simulateFail flag

```ts
import { describe, it, expect } from 'vitest'

describe('POST /api/checkout', () => {
  it('should return 400 if product out of stock', async () => {
    // Test implementation with Prisma mock or test DB
  })
})
```

### Implementation Snippet (only after test written)
```ts
// only write code to pass above test!
```

### Refactor Proposal (nếu có)
- Move shared logic to service class
- Use Zod for input validation
```

---

## Lưu ý khi sử dụng

- Tuyệt đối không viết code production trước khi có test.
- Các output phải mapping với case/spec thực tế, gắn tên file/test, method rõ ràng.
- Nếu có demo dữ liệu, seed, mock phải để rõ trong test.
- Tiếp tục quy trình: test fail -> code -> refactor cho tới khi đủ coverage hoặc iplement complete.

---

**Implement Chatmode (TDD): định hướng, sinh test trước, triển khai code tối ưu theo TDD — áp dụng cho mọi layer của Mini Storefront.**

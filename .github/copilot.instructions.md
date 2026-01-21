# Copilot Instructions

## Tổng quan

Repository này gồm 2 phần:
- **Frontend (FE):** Sử dụng Next.js và TypeScript.
- **Backend (BE):** Sử dụng Next.js (API routes) và TypeScript.

Tất cả đều được tối ưu hóa cho việc deploy trên [Vercel](https://vercel.com/). Bạn **có thể** tạo Dockerfile nếu cần deploy ở môi trường khác ngoài Vercel.

---

## Quy tắc chung

1. **Code phải rõ ràng, clean, dễ đọc & dễ bảo trì.**
2. **Sử dụng TypeScript mạnh mẽ:** Hạn chế `any`, ưu tiên kiểu an toàn tĩnh.
3. **Luôn xác thực đầu vào nhận từ phía client.**
4. **Luôn handle lỗi, không để throw lỗi thô trực tiếp ra response.**
5. **Không commit các file dư thừa hoặc secret lên repo.**
6. **Tách biệt logic FE và BE rõ ràng trong cấu trúc repo.**
7. **Cấu hình chuẩn cho Vercel:** `next.config.js`, `vercel.json` nếu cần.
8. **Thử nghiệm local trước khi PR, kiểm tra hoạt động khi build production (`next build`).**
9. **Luôn viết README, docs khi tạo hoặc chỉnh sửa functional lớn.**

---

## Quy tắc FE (Next.js + TypeScript)

1. **Nên đặt source code FE ở thư mục `/app` hoặc `/src` (`src/app` nếu dùng app router).**
2. Sử dụng **Component tái sử dụng** và chia nhỏ module.
3. Dùng **CSS Modules** hoặc **styled-components** (tuân theo quy chuẩn dự án).
4. Sử dụng **React hooks** chuẩn (`useState`, `useEffect`, `useContext`, ...).
5. **Không fetch API trực tiếp ở component nếu có thể dùng SSR/ISR/SSG.**
6. **SEO:** Sử dụng `<Head>` đúng chuẩn, tối ưu cho các page chính.
7. **Valid dữ liệu form:** Dùng Yup, Zod, hoặc schema-based validation khác.
8. **Test UI (nếu yêu cầu):** Có thể dùng Jest + Testing Library.
9. **Tách biệt phần cấu hình môi trường (`.env.*`), không hardcode sensitive vào code.**
10. **Deploy:** Luôn kiểm tra trên Vercel staging trước khi merge PR.

**Ví dụ cấu trúc FE:**
```
/src
  /app (hoặc /pages, tùy Next.js version)
  /components
  /lib
  /styles
  /hooks
  /utils
```

---

## Quy tắc BE (API routes Next.js hoặc src/server)

1. **Nên dùng `/pages/api` hoặc `/app/api` của Next.js.**
2. **Middleware xác thực:** Có sẵn, hoặc tự xây dựng với JWT/Session nếu cần xác thực.
3. **Routing rõ ràng, method chuẩn (GET/POST/PUT/DELETE).**
4. **Schema validate cho body/params:** Dùng Zod/Yup.
5. **Không expose stacktrace lỗi lên response khi production.**
6. **Tách riêng folder logic services nếu phức tạp.**
7. **Độc lập FE/BE nếu có thể (có thể deploy BE dạng serverless).**
8. **Tối ưu cho serverless:** Không giữ connection/watcher dài.

**Ví dụ cấu trúc BE:**
```
/pages/api
  /auth
  /users
  /example.ts
/src/server (nếu chia riêng logic BE)
  /services
  /utils
```

---

## Quy tắc Docker (nếu cần)

**Chỉ cần Docker khi deploy non-Vercel hoặc local simulate production.**

**Ví dụ Dockerfile:**
```Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]
```

> Nếu chỉ deploy trên Vercel thì **không cần Dockerfile**.  
> Hạn chế commit Dockerfile nếu dự án thuần Vercel.

---

## Một số best practice bổ sung

- **Sử dụng env vars chuẩn:** `.env.local` không commit lên repo.
- **Format code tự động:** Dùng Prettier, ESLint (bắt buộc).
- **Review code kỹ trước khi merge PR:** Đọc lại rules trên.
- **Không thay đổi cấu trúc chính hoặc config mà chưa được review kỹ.**
- **Cấu hình scripts npm/yarn hợp lý (`dev`, `build`, `start`, `lint`, `test`).**

---

## Triển khai lên Vercel

- Đảm bảo đã gắn đúng env var tại dashboard Vercel.
- Mỗi push lên branch sẽ trigger deploy preview.
- Trước khi merge vào production/main, kiểm tra kỹ bản preview.

---

## Nếu gặp lỗi khi deploy

- Kiểm tra log trên Vercel dashboard.
- Xem lại dependency, version của Next.js, node, typescript... nếu deploy log báo lỗi version.
- Đảm bảo không quên build step cần thiết.

---

# Kết luận

Tuân thủ các quy tắc trên để đảm bảo chất lượng high-standard cho dự án Next.js TypeScript khi chạy local, trên Docker hoặc Vercel production.

# 🍜 Lê Pi đi chơi (Hôm Nay Ăn Gì?)

> *Có những ngày, câu hỏi khó nhất không phải là công việc — mà là "Hôm nay ăn gì?"*

![Preview](preview.png)

Đây là một góc nhỏ trên Internet, được xây dựng riêng cho việc ăn gì? quán nào? chơi gì?. Mở web lên, xoay vòng quay, và đi ăn thôi!

---

## 🌻 Về dự án này

Dự án được thiết kế theo phong cách **Digital Garden**  pha chút Retro Scrapbook. Giao diện mang màu kem ấm của giấy cũ, điểm xuyết màu vàng đất, olive và terracotta. Các thẻ nội dung được bo góc lớn, hơi nghiêng nhẹ như những tờ giấy note được dán bằng băng keo washi. 

### Những thứ hay ho bên trong:
- **🎡 Dump wheel:** Xoay để chọn ngẫu nhiên món ăn, ly nước, hoặc điểm đi chơi. Có thể ẩn món đó đi trong ngày hôm nay hoặc cho vào Blacklist.
- **🗺️ Date map:** Toàn bộ kho tàng quán xá ngon nghẻ của Hà Nội được ghim trên một chiếc bản đồ duy nhất.


---

## 🛠 Lõi kỹ thuật (Tech Stack)

Một số lõi kỹ thuật chính:
- **Framework:** Next.js 15 (App Router)
- **Ngôn ngữ:** TypeScript
- **Giao diện:** TailwindCSS + Framer Motion
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **Khác:** Zod (validate), Lucide (icons), Leaflet (Bản đồ)

---

## 🚀 Cách dùng

Hướng dẫn:

1. **Tải code & Cài cắm thư viện:**
   ```bash
   npm install
   ```

2. **Kết nối Database:**
   Copy file `.env.example` thành file `.env` và điền đường dẫn tới Database PostgreSQL (ví dụ như Supabase) của bạn vào biến `DATABASE_URL`.

3. **Cập nhật Cấu trúc Database:**
   ```bash
   npx prisma db push
   ```

4. **Chạy thôi!**
   ```bash
   npm run dev
   ```
   *Mở trình duyệt lên và vào `http://localhost:3000` để bắt đầu random nhé!*

---

> *"Không sợ không chọn được, chỉ sợ thiếu thời gian ăn sập Hà Nội."*

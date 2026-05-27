# HSK Memory

Website học tiếng Trung **HSK4–HSK5** dành cho người Việt. Pure HTML/CSS/JavaScript, không backend, không build step. Mở `index.html` là chạy.

## Tính năng

- **60 từ vựng** (30 HSK4 + 30 HSK5) đầy đủ pinyin, nghĩa tiếng Việt, ví dụ có dịch, cụm từ thường dùng, giải thích đơn giản.
- **20 cấu trúc ngữ pháp** với công thức, ví dụ, lỗi sai thường gặp và bài tập điền nhanh.
- **~60 quiz** chia 5 dạng: Chọn nghĩa · Nghe chọn chữ Hán · Điền từ · Sắp xếp câu · Phân biệt từ dễ nhầm.
- **15 nhóm từ dễ nhầm** với so sánh nghĩa, cách dùng và mini quiz cho từng nhóm.
- **11 chủ đề** tiếng Trung thực tế: công việc, gia đình, sức khỏe, du lịch, cảm xúc, học tập, thi cử, mua sắm, xã hội, công nghệ, giao tiếp hằng ngày.
- **Flashcard** lật thẻ, 4 nút đánh giá khả năng nhớ → spaced repetition tự động lên lịch ôn.
- **Phát âm tiếng Trung** qua Web Speech API (zh-CN), có nghe chậm, nghe ví dụ, nghe lại, dừng.
- **Dashboard** số từ đã học, cần ôn, hay sai, chuỗi ngày liên tục, tiến độ HSK4/HSK5, tỷ lệ đúng quiz.
- **Lưu tiến độ trên trình duyệt** qua `localStorage` — không gửi server.
- **Tìm kiếm + 4 bộ lọc**: cấp HSK, chủ đề, trạng thái học, loại từ.
- **Luyện đặt câu**: nhập câu tiếng Trung, hệ thống check chứa từ, độ dài, dấu câu (sẵn chỗ TODO tích hợp AI sau).
- **Responsive**: mobile-first, breakpoint 768px / 900px, có hamburger menu.

## Cách chạy

### Cách 1 — Mở trực tiếp
Double-click `index.html`. Một số trình duyệt sẽ hạn chế audio khi mở file:// → nên dùng cách 2.

### Cách 2 — Local server
```bash
cd ~/Downloads/HSK-Memory
python3 -m http.server 8765
# Mở: http://localhost:8765
```

### Cách 3 — VS Code Live Server
Cài extension *Live Server*, chuột phải `index.html` → **Open with Live Server**.

## Cấu trúc file

```
HSK-Memory/
├── index.html      # 9 section + header sticky + hamburger
├── style.css       # Mobile-first, design tokens xanh ngọc
├── script.js       # Data + state + helper + renderer + event + init
├── README.md       # File này
└── .gitignore
```

## Cấu trúc `script.js`

Tách thành 8 block, mỗi block bắt đầu bằng comment `// === N. … ===`:

1. **CONST + DATA** — `VOCABULARY`, `GRAMMAR`, `QUIZZES`, `CONFUSING_WORDS`, `TOPICS`
2. **STATE + STORAGE** — `loadState` / `saveState` / `getWordProgress`
3. **HELPER — Dữ liệu** — `getVocabularyByLevel`, `searchVocabulary`, ...
4. **HELPER — Tiến độ** — spaced repetition, `markWordRemembered`, ...
5. **HELPER — Phát âm** — `speakChinese`, `getChineseVoice`, `speakSlowly`, ...
6. **RENDERERS** — mỗi section một hàm `render*`
7. **EVENT HANDLERS** — `attachGlobalListeners`, click delegation
8. **INIT** — `init()` chạy on `DOMContentLoaded`

## Thuật toán Spaced Repetition

| Hành động       | Hệ quả                                                  |
|-----------------|---------------------------------------------------------|
| Nhớ rồi         | `nextReviewAt` += 3 ngày · streak tăng                  |
| Chưa nhớ        | `nextReviewAt` += 10 phút · wrong tăng                  |
| Cần ôn lại      | `nextReviewAt` += 1 ngày · status = `review`            |
| Sai ≥ 3 lần     | status = `difficult` (gắn cờ "hay quên")                |
| Đúng liên tiếp ≥ 3 | status = `remembered`                                |
| Đúng liên tiếp ≥ 5 | status = `mastered`                                  |

## Thêm/sửa từ vựng

Mở `script.js`, tìm array `VOCABULARY` (block 1). Mỗi từ là một object có schema:

```js
{
  id: 'hsk4_xxx',        // duy nhất
  hanzi: '影响',
  pinyin: 'yǐngxiǎng',
  pinyinPlain: 'yingxiang', // không dấu, để search
  vietnamese: 'ảnh hưởng',
  level: 'HSK4',         // 'HSK4' | 'HSK5'
  topic: 'Xã hội',       // phải khớp TOPIC_NAMES
  wordType: 'động từ / danh từ',
  simpleExplanation: '...',
  commonPhrases: ['...'],
  examples: [{ cn:'...', pinyin:'...', vi:'...' }],
  confusingWords: ['印象', '形象'],
  tags: ['common'],
  difficulty: 3,
  audioUrl: '',          // nếu rỗng, dùng Web Speech API
  audioText: '影响'
}
```

## Debug

Thêm `?debug=1` vào URL → console log validation kiểm tra trùng id và targetWordId.

## Browser support

- **Web Speech API**: Chrome / Edge / Safari có sẵn voice tiếng Trung. Firefox cần cài voice OS.
- **localStorage**: tất cả trình duyệt hiện đại.
- **CSS Grid / IntersectionObserver**: tất cả trình duyệt từ 2018+.

## Roadmap

- [ ] Thêm 40 từ HSK4 + 40 HSK5 (total 100+ từ)
- [ ] Tích hợp AI sửa câu cho luyện đặt câu
- [ ] Export tiến độ học sang JSON
- [ ] Dark mode
- [ ] PWA — offline mode

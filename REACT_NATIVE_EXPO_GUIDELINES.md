📱 React Native (Expo) Project Guidelines

Clean Architecture – Scalable – Maintainable – Testable
Target: Android & iOS | Expo-based Development

1. 🎯 MỤC TIÊU THIẾT KẾ

Áp dụng công nghệ mới nhất, ổn định

Kiến trúc sạch – rõ ràng – dễ scale

Dễ bảo trì, dễ test, dễ onboarding dev mới

Performance mượt Android & iOS

Responsive đúng chuẩn (phone / tablet / safe-area)

Tuân thủ SEO (Expo Web) & Accessibility

Không file nào vượt quá 500 dòng code

Ưu tiên code dễ đọc > code thông minh quá mức

2. 🧱 TECH STACK KHUYẾN NGHỊ
Core

React Native >= 0.74

Expo SDK (Managed Workflow)

TypeScript (strict mode)

Navigation

expo-router (file-based routing)

State Management

Server State: @tanstack/react-query

Client/UI State: zustand

Styling

nativewind (TailwindCSS cho React Native)

Design Tokens (colors, spacing, radius, typography)

Forms & Validation

react-hook-form

zod

Animation

react-native-reanimated

react-native-gesture-handler

Testing

jest

@testing-library/react-native

detox (E2E – optional)

3. 🧠 KIẾN TRÚC TỔNG THỂ (CLEAN + FEATURE-BASED)

src/
├─ app/ # expo-router (chỉ routing)
│ ├─ (auth)/
│ ├─ (tabs)/
│ └─ _layout.tsx
│
├─ features/ # business features
│ ├─ auth/
│ │ ├─ components/
│ │ ├─ hooks/
│ │ ├─ services/
│ │ ├─ types.ts
│ │ └─ index.ts
│ ├─ cart/
│ ├─ order/
│ └─ profile/
│
├─ shared/ # dùng chung
│ ├─ components/
│ ├─ hooks/
│ ├─ services/
│ ├─ utils/
│ └─ constants/
│
├─ store/ # zustand stores
├─ api/ # API clients
├─ theme/ # design system & tokens
├─ types/ # global types
├─ config/ # env, app config
└─ tests/

Quy tắc bắt buộc

app/ KHÔNG chứa business logic

Business logic chỉ nằm trong features/

Không import chéo giữa các feature

4. 🧩 QUY TẮC PHÂN CHIA FILE
4.1 Giới hạn 500 dòng

1 file ≤ 500 lines

Vượt → bắt buộc tách

4.2 Component Rule

1 component = 1 trách nhiệm

UI thuần → components/

Logic → hooks/

❌ Sai
Screen = UI + fetch + validate + state + navigation

✅ Đúng
Screen
├─ useScreenLogic.ts
├─ ScreenView.tsx
└─ index.tsx

5. 🧭 ROUTING (EXPO ROUTER)
Nguyên tắc

File-based routing

Group route bằng (group)

Không logic trong file route

6. 🌐 API & DATA LAYER
6.1 HTTP Client

Chỉ config 1 nơi

Không gọi fetch trực tiếp trong UI

6.2 React Query

useQuery cho fetch

useMutation cho ghi dữ liệu

Cache-first strategy

7. 🧠 STATE MANAGEMENT
Zustand – chỉ dùng cho:

Auth state

UI state

Global flags

❌ Không dùng zustand cho server data
❌ Không biến zustand thành Redux

8. 🎨 UI / RESPONSIVE / PERFORMANCE
Responsive

Không hardcode width / height

Dùng:

useWindowDimensions

SafeAreaView

Platform.select

Performance

memo() cho component nặng

useCallback, useMemo đúng chỗ

FlatList:

keyExtractor

getItemLayout

removeClippedSubviews

9. ♿ ACCESSIBILITY & SEO (EXPO WEB)
Accessibility

accessible

accessibilityLabel

Contrast màu đạt WCAG

SEO (Expo Web)

expo-head

Dynamic title & meta description

Semantic structure

10. 🧪 TESTING STRATEGY
Test ưu tiên

hooks

services

utils

screen logic

Nguyên tắc

Test logic > test UI snapshot

Không test implementation detail

11. 🧹 CODE STYLE & CONVENTION
Naming

Component: PascalCase

Hook: useSomething

File: kebab-case.ts

ESLint & Prettier

Bắt buộc trước commit

No any

No unused vars

12. 🔐 ENV & CONFIG

Sử dụng Expo Env

Không hardcode key

Phân môi trường:

dev

staging

production

13. 🚀 CI / CD (KHUYẾN NGHỊ)

Pre-commit: lint + test

EAS Build

Expo OTA Update

14. ❗ CÁC ĐIỀU CẤM

File > 500 lines

Business logic trong route

Fetch API trong UI

Global state cho mọi thứ

Hardcode màu / size

Copy-paste logic giữa feature

15. ✅ CHECKLIST TRƯỚC KHI MERGE

 File < 500 lines

 Feature-based structure

 Có test cho logic chính

 Responsive Android & iOS OK

 Không warning TypeScript

 Không logic trong route

 Performance ổn (list, animation)

16. 📌 TƯ DUY CỐT LÕI

Code được đọc nhiều hơn được viết.

Ưu tiên:

Dễ đọc

Dễ sửa

Dễ mở rộng

Dễ scale team

Version: v1.0
Updated: 2025
Target: Production-grade React Native App (Expo)
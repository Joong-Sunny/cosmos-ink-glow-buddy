# 프로젝트 점검 결과 — 정리하면 좋은 부분

전체 코드를 훑어보면서 발견한 개선 포인트를 우선순위별로 정리했어. 모두 한 번에 할 필요는 없고, 원하는 항목만 골라서 진행하면 돼.

## 1. 명백한 버그 / 잘못된 파일 (먼저 처리 권장)

- **`src/routes/questions..tsx`** — 파일명에 점이 두 번 들어간 잘못된 파일. TanStack 라우터가 `/questions/` 인덱스 라우트로 인식하지만, 내부 코드는 `Route.useParams()`로 `bookId`를 읽음 → 항상 undefined가 되는 죽은 코드. `questions.$bookId.tsx`와 거의 동일 → **삭제**.
- **`src/routes/__root.tsx`의 `<html lang="en">`** — 콘텐츠는 전부 한국어인데 `lang` 속성이 영어로 설정됨. 접근성/SEO에 부정적. `lang="ko"`로 변경.
- **`og:image`가 lovable 프리뷰 스크린샷 URL** — 도메인이 바뀌거나 프리뷰가 만료되면 깨질 수 있음. 별도 OG 이미지를 `public/`에 넣고 절대 URL로 교체하거나 일단 제거.

## 2. 사용되지 않는/실험용 라우트

- **`src/routes/worldview-new.tsx`** — 하드코딩된 데모 카드("wc-iii")를 강제로 추가하는 실험 페이지. 어디에서도 링크되지 않음. 데모 용도면 `DemoControls`에 통합하거나 삭제.
- 데모 모드 컨트롤(`DemoControls.tsx`, 359줄)이 prod 번들에 포함되고 있음. `import.meta.env.DEV`로 가드해서 배포 빌드에서 제외 검토.

## 3. SEO — 라우트별 메타데이터 누락

`__root.tsx`의 기본 메타가 모든 페이지에 그대로 노출됨. 아래 라우트는 `head()`가 없거나 title만 있음:

- `closing.tsx`, `constellation.$keyword.tsx`, `search.tsx`, `star-born.$bookId.tsx`, `worldview.tsx`, `worldview.index.tsx`, `worldview.$cardId.tsx`, `worldview-new.tsx`
- `questions.$bookId.tsx`, `answer.$bookId.$questionId.tsx`, `analyzing.$bookId.tsx` — title만 있고 description/og 없음

각 라우트에 고유 title + description + (가능하면) og:title/description 추가 필요. 동적 라우트는 loader 데이터 기반으로 생성.

## 4. 리팩토링 — 거대 파일 분리

| 파일 | 라인 수 | 문제 |
|---|---|---|
| `routes/search.tsx` | 629 | 한 페이지에 너무 많은 책임 |
| `routes/register.tsx` | 402 | 폼/검색/등록 흐름 혼재 |
| `routes/answer.$bookId.$questionId.tsx` | 485 | 자동 타이핑 시뮬, UI, 상태 한 파일 |
| `components/home/UniverseView.tsx` | 500 | SVG 레이어 4개 + 뷰박스 애니메이션 |
| `components/DemoControls.tsx` | 359 | 데모 패널 |

`UniverseView`는 레이어별 서브컴포넌트(`PlanetLayer`, `CandidateLayer`, `LinkLayer`, `HubLayer`, `StarLayer`) + `useAnimatedViewBox` 훅 분리만 해도 가독성이 크게 좋아짐.

## 5. 디자인 시스템 일관성

`styles.css`에 잘 만들어 둔 디자인 토큰/유틸리티가 정작 컴포넌트에서 거의 안 쓰이고 있어:

- `text-meta`, `text-display`, `text-body`, `card-cosmic` 같은 `@utility`들이 정의돼 있는데 대부분 인라인 `style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", ... }}`로 중복 작성되고 있음.
- 사례: `worldview.$cardId.tsx`, `worldview.index.tsx`, `index.tsx`, `BookDetailPanel.tsx` 등 거의 모든 화면.
- 인라인 스타일을 유틸리티 클래스로 치환하면 시각적 일관성 + 코드 50% 가까이 축소 가능.

## 6. 폰트 로딩 성능

`styles.css`에서 Pretendard CDN + Google Fonts(5개 패밀리, italic+roman, opsz 변수축까지)를 한 번에 import. 첫 페인트가 무거움.

- `<link rel="preconnect">`를 `__root.tsx`에 추가
- `Cormorant Garamond` 폴백은 거의 안 쓰일 가능성이 높음 → 제거 후 단순화
- `Gowun Batang`도 폴백으로만 쓰는데 굳이 두 weight 다 받을 필요 없음

## 7. 사소한 정리

- `book-database.ts`(175줄, books.csv 파서)가 어디서도 import되지 않는 것으로 보임. 사용처 재확인 후 삭제 또는 연결.
- `src/router.tsx` / `src/start.ts` / `src/server.ts`는 손대지 말 것 (TanStack 부트스트랩).

---

## 권장 진행 순서

1. **Quick wins (5분)**: `questions..tsx` 삭제, `lang="ko"` 수정, `worldview-new.tsx` 제거
2. **SEO**: 각 라우트에 head() 추가
3. **디자인 토큰 일관화**: 인라인 스타일 → 유틸리티 클래스로 치환
4. **리팩토링**: `UniverseView` 분리부터 시작 → `search`, `answer`

어디서부터 시작할까? 1번(Quick wins)만 먼저 해도 되고, 1+2+3 묶음으로 진행해도 좋아.

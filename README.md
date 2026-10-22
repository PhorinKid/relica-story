# RELICA STORY

RELICA의 세계관과 네 멤버를 소개하고, 클래스 테스트와 Phaser 디펜스 게임을 즐기는 웹사이트입니다. HTML·CSS·JavaScript로 구성되어 있으며 별도 빌드 과정이 없습니다. 현재 PC 화면을 중심으로 제작 중이며 모바일 완성은 후속 작업입니다.

## 실행

폴더의 `index.html`을 직접 열면 소개·클래스 테스트·게임을 이용할 수 있습니다. 이메일 인증과 계정 기능을 확인할 때는 웹 서버 주소를 사용합니다.

Node.js 20 이상에서 프로젝트 루트에서 실행합니다.

```sh
npm ci
npm run dev
```

접속 주소: http://127.0.0.1:4173/

Phaser와 Supabase SDK 배포 파일은 라이선스와 함께 `assets/vendor/`에 보관합니다. 로그인·서버 저장에는 Supabase 연결이 필요합니다.

## 폴더 구성

```text
relica-story/
├─ index.html / styles.css        웹 화면과 스타일
├─ app.js / model.js              메뉴·멤버 소개·클래스 테스트
├─ combat.js / game.js            전투 계산과 Phaser 화면
├─ account.js / auth-ui.js        계정과 저장 UI
├─ public-config.js               Supabase 공개 연결 설정
├─ server.cjs                     로컬 미리보기 서버
├─ assets/                        실제 사용하는 이미지·게임 표현·외부 라이브러리
│  ├─ story/                      홈·멤버 소개 일러스트
│  ├─ characters/                 게임 SD 이미지와 프레임 정보
│  ├─ backgrounds/                멤버별 게임 배경
│  └─ vendor/                     고정 버전 라이브러리와 라이선스
├─ docs/                          사용 안내·콘텐츠 출처·제작 기록
├─ supabase/schema.sql            DB 테이블·접근 권한·기록 병합 함수
├─ tests/                         자동 테스트와 브라우저 검사
├─ 스킬_설명과_수치_수정용.txt      현재 스킬 통합 메모
└─ 스킬_정리/                     공용·멤버별 스킬 메모
```

문서 안내: [docs/README.md](docs/README.md)

## 현재 기능

- 입장 화면 → 홈 → RELICA 세계관과 멤버 상세 소개.
- 8문항 클래스 테스트 → 결과 카드 → 추천 멤버로 게임 시작.
- 이메일 회원가입·인증·로그인·로그아웃·비밀번호 재설정.
- 게스트 기록은 브라우저에, 계정 기록은 Supabase와 동기화. 로그인 시 게스트 기록을 합칩니다.
- 네 멤버의 자동 발사, 자동/수동 조준, 레벨업 강화 선택, 1×/2× 배속.
- 스테이지 클리어 후 대기·계속하기, 무한 모드 중단·결과·최고 기록.

사용자께서 회원가입과 이메일 인증의 정상 작동을 확인했습니다. 다른 브라우저에서 계정 기록을 복원하는 실사용 확인은 남아 있습니다. 진행 중인 전투는 브라우저 종료·새로고침 후 복원하지 않습니다.

## 게임·스킬 수정

현재 기준은 `스킬_설명과_수치_수정용.txt`와 `스킬_정리/`입니다. 파일을 수정해 대화에 전달하면 설명과 실제 수치를 함께 반영합니다. 게임이 메모장을 자동으로 읽거나 통합본·분리본을 동기화하지는 않습니다.

- 스테이지 체력 30, 무한 체력 50. 적당 도달 피해 1, 스테이지 클리어 회복 5(상한 30).
- 무한 모드는 게임 시간 2초마다 묶음 출현. 처음 1마리에서 10킬마다 증가해 최대 16마리입니다. 생존 몬스터 총수에는 상한을 두지 않습니다.
- 몬스터 외형별 기본 체력·속도: 결정형 34/26, 박쥐형 22/38, 슬라임형 56/18.
- 처치 경험치는 최대 체력에 비례합니다. 전투 종료 후 레벨과 강화는 초기화됩니다.
- 이미지·애니메이션과 밸런스는 후속 조정 대상입니다.

## Supabase

설정과 DB 실행 안내: [Supabase 연결 안내](docs/setup/Supabase_연결_안내.txt)

`public-config.js`에는 브라우저 공개용 URL과 Publishable key만 사용합니다. SQL은 초기 테이블·RLS·기록 병합 함수를 구성하며 기존 사용자 데이터를 삭제하지 않습니다. 배포 후에는 Supabase의 인증 복귀 URL에 실제 사이트 주소를 등록해야 합니다.

## 검증

```sh
npm test
```

실제 Edge/Playwright 검사(서버를 먼저 실행):

```sh
node tests/story-browser.cjs
node tests/file-browser.cjs
node tests/game-browser.cjs
node tests/quiz-browser.cjs
```

브라우저 검사는 별도 Playwright 설치가 필요합니다. 설치 위치가 기본 모듈 경로와 다르면 `RELICA_PLAYWRIGHT_MODULE`에 모듈 경로를 지정합니다. 캡처는 `output/`에 생성되며 Git 업로드에서 제외됩니다.

## GitHub 업로드 범위

이 폴더만 독립 저장소로 사용합니다. `assets/`와 라이선스·설정·테스트·현재 메모를 포함합니다. `node_modules/`, `output/`, `.env` 계열, 참고 이미지 원본과 과거 사용자 메모 사본은 `.gitignore`로 제외합니다. 참고 이미지와 메모 사본은 로컬 폴더에 보관됩니다.

GitHub 저장소: [PhorinKid/relica-story](https://github.com/PhorinKid/relica-story)

## Analytics / Tag Manager

GTM `GTM-WLG9XTKF`를 공통 HTML에 설치합니다. GA4 `G-BY8CYHDV4H`는 GTM의 Google 태그에서 연결합니다. 직접 GA 코드는 중복 설치하지 않습니다. 관리자 게시 및 검증 절차는 [설정 안내](docs/setup/analytics.md)를 확인하세요.

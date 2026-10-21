# 임시 배경 및 자료 출처

## 확인한 자료

프로젝트 상위의 02_브랜드_프로젝트/RELICA/03_GPT_프로젝트_업로드팩_2026-09-18/01_한글_원본/ 에 있는 다음 파일을 읽었습니다.

- 01_RELICA-기준설정.md: 그룹 소개, 네 클래스, 판타지 분위기, 주요 장소, 그룹 BI 색상 및 멤버 기본 5색
- 02_멤버-상세설정.md: 멤버 이름, 역할, 성격, 외형 기준
- images/members/AREN-concept-sheet.png, ELIA-concept-sheet.png, SELENE-concept-sheet.png, NOIR-concept-sheet.png: 실제 이미지 육안 확인 및 배경 스타일 참고

원본 파일은 수정하지 않았습니다. 멤버 소개 문구는 위 문서를 요약했습니다. 대표 문장은 설정 문서의 작업 문구이며 새로운 공식 캐치프레이즈로 확정한 것이 아닙니다.

## 배경 이미지

- 파일: assets/sanctuary-background.png
- 생성: 내장 image_gen 도구 사용. CLI/API 별도 호출 없음.
- 용도: 입장 화면 및 홈의 임시 배경
- 설명: 네이비와 라벤더, 실버 색조의 별하늘, 숲과 산맥, 호수, 원형 석조 성소를 담은 애니메이션풍 풍경입니다.
- 위치나 건축물의 정확한 모습은 공식 세계관으로 확정한 것이 아닙니다. 생성 결과의 먼 수정/건축물은 분위기 표현입니다.
- 캐릭터 시트는 스타일/색감 참고로만 제공했으며 캐릭터나 문자를 배경에 넣지 않았습니다.
- 실제 캐릭터 및 몬스터 게임 이미지는 만들지 않았습니다. 현재는 CSS 도형을 사용합니다.

## 최종 생성 프롬프트

Use case: stylized-concept. Asset type: temporary full-screen website entrance background for RELICA STORY. Reference images: the four provided RELICA character concept sheets are STYLE and COLOR references ONLY; do not draw any characters or reproduce the sheets, writing or panels. Create one beautiful wide landscape 16:9 anime fantasy environment illustration, high quality 2D painted/cel-shaded environment coherent with these elegant anime characters. An ancient circular stone sanctuary in a forest clearing, slender vertical softly luminous crystal in the distance, mountain silhouettes, tranquil lake or mist, weathered stone pillars framing the far left and far right. Twilight midnight navy #081848, muted relic violet #503890 and moon silver #CCD0D8 with subtle sage foliage, gentle lavender glow and sparse tiny star lights. Hopeful, mysterious, lyrical atmosphere, not horror or grimdark. Composition: expansive clean dark sky in the upper and middle center to accommodate an oversized live HTML RELICA title; scenery concentrated on sides and lower third. Wide cinematic atmospheric depth, restrained lighting, beautiful fine texture, no oversized moon and no floating castle. Empty environment only, absolutely no people, weapons, lettering, logo, watermark or UI. This is an illustrative temporary background, do not invent named places or lore.

## 2026-10-21 임시 게임 픽셀 표현

assets/game-presentation.js에서 코드로 그린 픽셀 외형입니다. 원본 PNG를 편집하지 않았으며 별도의 이미지 생성 서비스나 외부 음원을 쓰지 않았습니다. 멤버별 기본 5색과 기존 머리/의상/무기 특징을 참고한 게임용 초안입니다. 배경 숲·유적·등불·적 3종은 임시 장식이며 공식 세계관 장소나 몬스터 설정이 아닙니다. 스킨과 중성 윤곽색은 가독성을 위한 표현입니다. 효과음은 Web Audio의 합성 신호이며 배경음악은 추가하지 않았습니다.

## SD 멤버 이미지 개정

기존 코드 픽셀 멤버를 assets/characters/{aren,elia,selene,noir}-sd-v1.png로 교체했습니다. 네 기준 시트를 이미지로 열어 확인했고 각각 built-in image_gen을 사용했습니다. 이미지 역할은 identity/outfit/color/weapon reference입니다. 전체 프롬프트는 sd-character-prompts.md를 참고하세요. 배경 레퍼런스가 없으므로 새 멤버별 배경을 생성하지 않았습니다.

## 멤버별 환경 배경 적용 — 앞선 레퍼런스 대기 상태 해소

사용자가 제공한 4개 첨부 이미지를 참고해 built-in image_gen으로 배경을 생성했습니다. 참조 이미지는 docs/art/references/에 멤버별로 보관했고, 배포용 결과는 assets/backgrounds/에 있습니다. 매핑은 아렌=황야·성채, 엘리아=숲, 셀렌=호수, 누아르=중세 밤 도심입니다. 레퍼런스는 분위기·구조 참고이며 전체 생성 프롬프트는 member-background-prompts.md에 기록했습니다. 코드 배경은 로드 실패 시의 예비 표현으로 남겨두었습니다. 공식 설정에 새 장소명을 추가하지 않았습니다.

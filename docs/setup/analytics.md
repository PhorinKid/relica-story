# Analytics / Tag Manager

- GTM 컨테이너: GTM-WLG9XTKF
- GA4 측정 ID: G-BY8CYHDV4H
- 공통 index.html의 head와 body 시작에 설치했습니다. 모든 메뉴가 같은 HTML을 사용하므로 추가 삽입은 필요하지 않습니다.
- 중복 집계를 방지하기 위해 직접 gtag 로더와 config 호출은 넣지 않습니다. GA4 전송은 GTM에서 관리합니다.

## GTM 관리자에서 필요한 설정

1. GTM-WLG9XTKF 컨테이너에서 태그 → 새로 만들기 → Google 태그를 선택합니다.
2. 태그 ID에 G-BY8CYHDV4H를 입력합니다.
3. 트리거는 Initialization - All Pages를 선택합니다.
4. 미리보기에서 Google 태그 실행을 확인하고 제출 → 게시합니다.
5. 배포한 사이트를 방문해 GA4 실시간 또는 DebugView에서 수집을 확인합니다.

사이트 코드 설치와 GTM 관리자 게시는 별도입니다. 이 문서는 관리자 설정이 완료되었다는 의미가 아닙니다. 현재는 기본 방문 측정이며, 화면 내부 메뉴별 가상 페이지뷰나 맞춤 이벤트는 추가하지 않았습니다.

공식 안내: https://support.google.com/tagmanager/answer/15756616?hl=ko

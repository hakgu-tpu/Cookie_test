# HttpOnly 쿠키 테스트 가이드

## 🚀 서버 실행 방법

### 1. Spring Boot 서버 실행
```bash
cd cookie
./gradlew bootRun
```
서버가 http://localhost:8080 에서 실행됩니다.

### 2. HTML 파일 서빙용 HTTP 서버 실행
```bash
python simple_server.py
```
HTTP 서버가 http://localhost:3000 에서 실행됩니다.

## 🧪 테스트 절차

1. **브라우저에서 접속**: http://localhost:3000/cookie_test.html
2. **개발자 도구 열기**: F12 키
3. **Network 탭 열기**: 요청/응답 확인용
4. **Application 탭 열기**: 쿠키 저장 상태 확인용

## 🔍 예상되는 문제와 해결책

### 문제 1: 쿠키가 전송되지 않음
- **원인**: SameSite 정책 또는 CORS 설정
- **해결**: SameSite=None으로 설정 (현재 적용됨)

### 문제 2: CORS 오류
- **원인**: Cross-Origin 요청 차단
- **해결**: CORS 설정에서 allowCredentials=true 설정 (현재 적용됨)

### 문제 3: file:// 프로토콜 문제
- **원인**: 브라우저가 file:// 에서 쿠키 전송 제한
- **해결**: HTTP 서버 사용 (simple_server.py)

## 📊 테스트 결과 확인 방법

1. **쿠키 설정 후**: Application → Cookies → localhost:8080 확인
2. **HTTP 요청 시**: Network 탭에서 Cookie 헤더 확인
3. **서버 로그**: Spring Boot 콘솔에서 쿠키 수신 로그 확인

## 🎯 핵심 확인 사항

✅ **HttpOnly 쿠키는 JavaScript로 읽을 수 없음**
✅ **하지만 HTTP 요청 시 자동으로 전송됨**
✅ **매 요청마다 브라우저가 자동으로 포함시킴**

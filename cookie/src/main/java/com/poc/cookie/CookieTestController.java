package com.poc.cookie;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cookie-test")

@Slf4j
public class CookieTestController {

    /**
     * HttpOnly Refresh Token 설정
     */
    @PostMapping("/set-refresh-token")
    public ResponseEntity<Map<String, Object>> setRefreshToken(
            HttpServletResponse response,
            @RequestParam(defaultValue = "default-refresh-token-value") String tokenValue) {

        log.info("🍪 [{}] Refresh Token 설정 요청 - 값: {}", LocalDateTime.now(), tokenValue);

        // HttpOnly Refresh Token 쿠키 생성
        Cookie refreshTokenCookie = new Cookie("refreshToken", tokenValue);
        refreshTokenCookie.setHttpOnly(true);           // JavaScript 접근 불가
        refreshTokenCookie.setSecure(false);            // HTTP에서도 테스트 (실제로는 true)
        refreshTokenCookie.setPath("/");                // 모든 경로에서 전송
        refreshTokenCookie.setMaxAge(60 * 60 * 24 * 7); // 7일
        refreshTokenCookie.setAttribute("SameSite", "None"); // Cross-origin 허용

        response.addCookie(refreshTokenCookie);

        // 일반 쿠키도 설정 (비교용)
        Cookie normalCookie = new Cookie("normalToken", "normal-token-value");
        normalCookie.setHttpOnly(false); // JavaScript 접근 가능
        normalCookie.setPath("/");
        normalCookie.setMaxAge(60 * 60 * 24 * 7);
        normalCookie.setAttribute("SameSite", "None");

        response.addCookie(normalCookie);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "쿠키 설정 완료");
        result.put("refreshToken", "HttpOnly로 설정됨 (JavaScript 접근 불가)");
        result.put("normalToken", "일반 쿠키로 설정됨 (JavaScript 접근 가능)");
        result.put("timestamp", LocalDateTime.now());

        return ResponseEntity.ok(result);
    }

    /**
     * 모든 쿠키 확인 - 자동 전송 여부 테스트
     */
    @GetMapping("/check-cookies")
    public ResponseEntity<Map<String, Object>> checkCookies(HttpServletRequest request) {

        log.info("🔍 [{}] 쿠키 확인 요청", LocalDateTime.now());
        log.info("📍 요청 Origin: {}", request.getHeader("Origin"));
        log.info("📍 요청 Referer: {}", request.getHeader("Referer"));
        log.info("📍 요청 User-Agent: {}", request.getHeader("User-Agent"));

        Map<String, String> receivedCookies = new HashMap<>();

        if (request.getCookies() != null) {
            log.info("📨 총 {} 개의 쿠키 수신", request.getCookies().length);
            Arrays.stream(request.getCookies())
                    .forEach(cookie -> {
                        receivedCookies.put(cookie.getName(), cookie.getValue());
                        log.info("📨 받은 쿠키: {} = {}", cookie.getName(), cookie.getValue());
                    });
        } else {
            log.warn("❌ 쿠키가 전혀 전송되지 않음");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("receivedCookies", receivedCookies);
        result.put("refreshTokenPresent", receivedCookies.containsKey("refreshToken"));
        result.put("normalTokenPresent", receivedCookies.containsKey("normalToken"));
        result.put("timestamp", LocalDateTime.now());
        result.put("requestOrigin", request.getHeader("Origin"));
        result.put("requestReferer", request.getHeader("Referer"));
        result.put("message", receivedCookies.isEmpty() ?
                "쿠키가 전송되지 않음" : "쿠키가 자동으로 전송됨");

        return ResponseEntity.ok(result);
    }

    /**
     * Refresh Token 전용 엔드포인트
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(HttpServletRequest request) {

        log.info("🔄 [{}] 토큰 갱신 요청", LocalDateTime.now());

        String refreshToken = null;

        if (request.getCookies() != null) {
            refreshToken = Arrays.stream(request.getCookies())
                    .filter(cookie -> "refreshToken".equals(cookie.getName()))
                    .findFirst()
                    .map(Cookie::getValue)
                    .orElse(null);
        }

        Map<String, Object> result = new HashMap<>();

        if (refreshToken != null) {
            log.info("✅ Refresh Token 자동 전송 확인: {}", refreshToken);

            // 새로운 Access Token 생성 (시뮬레이션)
            String newAccessToken = "new-access-token-" + System.currentTimeMillis();

            result.put("success", true);
            result.put("message", "Refresh Token이 자동으로 전송되어 갱신 성공");
            result.put("refreshToken", refreshToken);
            result.put("newAccessToken", newAccessToken);
        } else {
            log.warn("❌ Refresh Token이 전송되지 않음");

            result.put("success", false);
            result.put("message", "Refresh Token이 전송되지 않음");
        }

        result.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(result);
    }

    /**
     * 다른 도메인 요청 시뮬레이션
     */
    @GetMapping("/cross-origin-test")
    public ResponseEntity<Map<String, Object>> crossOriginTest(HttpServletRequest request) {

        log.info("🌐 [{}] Cross-Origin 요청", LocalDateTime.now());

        Map<String, String> cookies = new HashMap<>();
        if (request.getCookies() != null) {
            Arrays.stream(request.getCookies())
                    .forEach(cookie -> cookies.put(cookie.getName(), cookie.getValue()));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("cookies", cookies);
        result.put("message", "Cross-Origin 요청에서의 쿠키 전송 테스트");
        result.put("origin", request.getHeader("Origin"));
        result.put("referer", request.getHeader("Referer"));

        return ResponseEntity.ok(result);
    }

    /**
     * 쿠키 삭제
     */
    @DeleteMapping("/clear-cookies")
    public ResponseEntity<Map<String, Object>> clearCookies(HttpServletResponse response) {

        log.info("🗑️ [{}] 쿠키 삭제 요청", LocalDateTime.now());

        // Refresh Token 쿠키 삭제
        Cookie refreshTokenCookie = new Cookie("refreshToken", "");
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(0); // 즉시 만료
        response.addCookie(refreshTokenCookie);

        // Normal Token 쿠키 삭제
        Cookie normalCookie = new Cookie("normalToken", "");
        normalCookie.setPath("/");
        normalCookie.setMaxAge(0);
        response.addCookie(normalCookie);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "모든 쿠키 삭제 완료");
        result.put("timestamp", LocalDateTime.now());

        return ResponseEntity.ok(result);
    }
}
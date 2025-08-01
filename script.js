const API_BASE = 'http://localhost:8080/api/cookie-test';

// 쿠키 상태 업데이트
function updateCookieStatus() {
    const allCookies = document.cookie;
    
    // Normal Token은 JavaScript로 접근 가능
    const normalToken = getCookie('normalToken');
    const normalCard = document.getElementById('normalTokenCard');
    const normalStatus = document.getElementById('normalTokenStatus');
    
    if (normalToken) {
        normalCard.className = 'cookie-card active';
        normalStatus.textContent = `설정됨: ${normalToken}`;
    } else {
        normalCard.className = 'cookie-card inactive';
        normalStatus.textContent = '설정되지 않음';
    }

    // HttpOnly는 JavaScript로 접근 불가능하므로 서버에서 확인
    checkCookiesFromServer();
}

// 쿠키 값 가져오기 (일반 쿠키만)
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// 서버에서 쿠키 상태 확인
async function checkCookiesFromServer() {
    try {
        const response = await fetch(`${API_BASE}/check-cookies`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        const refreshCard = document.getElementById('refreshTokenCard');
        const refreshStatus = document.getElementById('refreshTokenStatus');
        
        if (data.refreshTokenPresent) {
            refreshCard.className = 'cookie-card active';
            refreshStatus.textContent = '설정됨 (HttpOnly)';
        } else {
            refreshCard.className = 'cookie-card inactive';
            refreshStatus.textContent = '설정되지 않음';
        }
    } catch (error) {
        console.error('쿠키 상태 확인 실패:', error);
    }
}

// 1. Refresh Token 설정
async function setRefreshToken() {
    try {
        const tokenValue = `refresh-token-${Date.now()}`;
        const response = await fetch(`${API_BASE}/set-refresh-token?tokenValue=${tokenValue}`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        console.log('✅ 쿠키 설정 완료:', data);
        
        setTimeout(updateCookieStatus, 100);
        
        alert('🍪 쿠키가 설정되었습니다!\n개발자 도구 → Application → Cookies에서 확인해보세요.');
    } catch (error) {
        console.error('❌ 쿠키 설정 실패:', error);
        alert('쿠키 설정에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
    }
}

// 2. JavaScript 접근 테스트
function testJavaScriptAccess() {
    const result = document.getElementById('jsAccessResult');
    
    const testResult = `
🔍 JavaScript 쿠키 접근 테스트 (${new Date().toLocaleTimeString()})

document.cookie 결과:
"${document.cookie}"

분석:
${document.cookie.includes('refreshToken') ? 
    '❌ 예상과 다름: refreshToken이 JavaScript로 접근 가능함' : 
    '✅ 예상대로: refreshToken은 HttpOnly이므로 JavaScript로 접근 불가'}

${document.cookie.includes('normalToken') ? 
    '✅ normalToken은 일반 쿠키이므로 JavaScript로 접근 가능' : 
    '⚠️ normalToken이 설정되지 않았거나 만료됨'}

💡 결론: HttpOnly 쿠키는 보안상 JavaScript로 읽을 수 없습니다.
           하지만 HTTP 요청 시에는 자동으로 전송됩니다!
    `;
    
    result.textContent = testResult;
}

// 3. 쿠키 전송 확인
async function checkCookies() {
    const resultArea = document.getElementById('httpResult');
    resultArea.textContent = '🔄 서버에 요청 중...';
    
    try {
        const response = await fetch(`${API_BASE}/check-cookies`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        const result = `
📨 HTTP 요청 시 쿠키 전송 테스트 (${new Date().toLocaleTimeString()})

서버에서 받은 쿠키:
${JSON.stringify(data.receivedCookies, null, 2)}

분석:
✅ Refresh Token 전송됨: ${data.refreshTokenPresent ? 'YES' : 'NO'}
✅ Normal Token 전송됨: ${data.normalTokenPresent ? 'YES' : 'NO'}

💡 결론: ${data.message}

🛠️ 개발자 도구 Network 탭에서 실제 Cookie 헤더를 확인해보세요!
        `;
        
        resultArea.textContent = result;
    } catch (error) {
        resultArea.textContent = `❌ 요청 실패: ${error.message}`;
    }
}

// 4. 토큰 갱신 테스트
async function testRefreshToken() {
    const resultArea = document.getElementById('httpResult');
    resultArea.textContent = '🔄 토큰 갱신 중...';
    
    try {
        const response = await fetch(`${API_BASE}/refresh`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        const result = `
🔄 Refresh Token 갱신 테스트 (${new Date().toLocaleTimeString()})

갱신 결과: ${data.success ? '✅ 성공' : '❌ 실패'}
메시지: ${data.message}

${data.success ? `
전송된 Refresh Token: ${data.refreshToken}
새로 발급된 Access Token: ${data.newAccessToken}

💡 HttpOnly 쿠키가 자동으로 전송되어 토큰 갱신이 성공했습니다!
` : `
💡 Refresh Token이 설정되지 않았습니다. 먼저 쿠키를 설정해주세요.
`}
        `;
        
        resultArea.textContent = result;
    } catch (error) {
        resultArea.textContent = `❌ 갱신 실패: ${error.message}`;
    }
}

// 5. 연속 요청 테스트
async function testMultipleRequests() {
    const resultArea = document.getElementById('httpResult');
    resultArea.textContent = '🔄 연속 요청 테스트 중...';
    
    let results = [];
    
    for (let i = 1; i <= 3; i++) {
        try {
            const response = await fetch(`${API_BASE}/check-cookies`, {
                credentials: 'include'
            });
            
            const data = await response.json();
            results.push(`${i}번째 요청: RefreshToken=${data.refreshTokenPresent}, NormalToken=${data.normalTokenPresent}`);
            
            // UI 업데이트
            resultArea.textContent = `🔄 ${i}/3 요청 완료...`;
            
            // 1초 간격
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            results.push(`${i}번째 요청 실패: ${error.message}`);
        }
    }
    
    const finalResult = `
🔄 연속 HTTP 요청 테스트 (${new Date().toLocaleTimeString()})

${results.join('\n')}

💡 결론: HttpOnly 쿠키는 모든 HTTP 요청에 자동으로 포함됩니다.
         클라이언트가 "원할 때마다" 전송하는 것이 아니라,
         브라우저가 조건에 맞으면 "항상 자동으로" 전송합니다!

🔍 Network 탭에서 각 요청의 Cookie 헤더를 확인해보세요.
    `;
    
    resultArea.textContent = finalResult;
}

// 6. 쿠키 삭제
async function clearCookies() {
    try {
        await fetch(`${API_BASE}/clear-cookies`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        setTimeout(updateCookieStatus, 100);
        alert('🗑️ 모든 쿠키가 삭제되었습니다!');
    } catch (error) {
        console.error('쿠키 삭제 실패:', error);
    }
}

// 페이지 로드 시 쿠키 상태 확인
window.addEventListener('load', () => {
    updateCookieStatus();
    
    // 주기적으로 상태 업데이트
    setInterval(updateCookieStatus, 5000);
});
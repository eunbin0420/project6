// 두 번째 이미지의 실제 엘리베이터 이동 시간 데이터 반영 (1층 기준)
const travelTimes = {
    '2': 9.02,
    '3': 12.01,
    '4': 16.31,
    '5': 19.88,
    '6': 22.27,
    '7': 25.84,
    '8': 29.25
};

// 엘리베이터 초기 상태 관리
let state = {
    currentLocation: 1,         // 내 현재 위치 (1층으로 가정)
    displayFloor: 12,           // 메인 화면에 표시되는 엘리베이터의 현재 위치 (초기값 사진 속 12층)
    displayDirection: '&uarr;',  // 메인 화면 방향 기호
    targetFloor: null,          // 이동 목표 층
    callDirection: null,        // 누른 버튼 방향 ('up' 또는 'down')
    isMoving: false,            // 동작 중 여부
    timer: null                 // 카운트다운용 타이머 변수
};

// DOM 요소 매핑
const currentFloorText = document.getElementById('current-floor');
    const displayDirection = document.getElementById('display-direction');
const displayFloor = document.getElementById('display-floor');
const waitTimeText = document.getElementById('wait-time');
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');

// 화면 표시 업데이트 함수
function updateDisplay() {
    currentFloorText.textContent = `현재 위치: ${state.currentLocation}층`;
    displayDirection.innerHTML = state.displayDirection;
    displayFloor.textContent = String(state.displayFloor).padStart(2, '0');
}

// 엘리베이터 호출 처리 함수
function callElevator(direction) {
    if (state.isMoving) return; // 이미 움직이는 중이면 중복 클릭 방지

    state.callDirection = direction;
    waitTimeText.textContent = '...';

    // 데이터가 '1층에서 위로 출발할 때'를 기준으로 있으므로, 1층에서 위층(예: 8층)의 엘리베이터를 부르는 시뮬레이션 적용
    if (direction === 'up' && state.currentLocation === 1) {
        const target = 8; // 예시 데이터 기준 최상층인 8층 지정
        const timeToWait = travelTimes[String(target)] || 0;
        
        waitTimeText.textContent = `${timeToWait.toFixed(2)}초`;
        waitTimeText.style.color = '#55ff55'; // 정상 작동 시 초록색 피드백
        state.targetFloor = target;
        state.isMoving = true;
        
        startCountdown();
    } else {
        // 측정 데이터가 없는 구간(예: 1층에서 아래 버튼을 누르는 등)의 경우 예외 처리
        setTimeout(() => {
            waitTimeText.textContent = '--초';
            waitTimeText.style.color = '#ff3333';
        }, 300);
        setTimeout(() => waitTimeText.style.color = '#ffaa33', 1500);
    }
}

// 실시간 초 단위 카운트다운 및 디스플레이 연동 로직
function startCountdown() {
    let currentWaitTime = parseFloat(waitTimeText.textContent.replace('초', ''));
    const totalTime = currentWaitTime;
    const intervalTime = 100; // 0.1초 단위로 부드럽게 감소

    state.displayDirection = '&uarr;';
    updateDisplay();

    state.timer = setInterval(() => {
        currentWaitTime -= (intervalTime / 1000);
        
        if (currentWaitTime <= 0) {
            clearInterval(state.timer);
            waitTimeText.textContent = '0.00초';
            waitTimeText.style.color = '#ffaa33';
            
            // 도착 완료 상태 반영
            state.currentLocation = 1; 
            state.displayDirection = ''; 
            state.displayFloor = 1;
            state.isMoving = false;
            updateDisplay();
            
            // 2초 후에 대기 상태(--초)로 되돌림
            setTimeout(() => {
                waitTimeText.textContent = '--초';
            }, 2000);
            return;
        }

        // 남은 시간 화면 표시
        waitTimeText.textContent = `${currentWaitTime.toFixed(2)}초`;
        
        // 시간에 비례하여 메인 디스플레이 층수가 변하는 연출 (8층에서 1층으로 내려오는 연출)
        const progress = 1 - (currentWaitTime / totalTime);
        state.displayFloor = Math.round(8 - (7 * progress));
        updateDisplay();
    }, intervalTime);
}

// 버튼 이벤트 리스너 등록
upBtn.addEventListener('click', () => callElevator('up'));
downBtn.addEventListener('click', () => callElevator('down'));

// 초기 실행
updateDisplay();

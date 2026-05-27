// 제공해주셨던 실측 데이터 (1층 기준 각 층별 도달 소요 시간)
const BASE_TRAVEL_TIMES = {
    1: 0.00,
    2: 9.02,
    3: 12.01,
    4: 16.31,
    5: 19.88,
    6: 22.27,
    7: 25.84,
    8: 29.25
};

// 평균적인 한 층 이동 속도 계산 (데이터 외의 층 계산용: 약 4.17초/층)
const AVG_SPEED_PER_FLOOR = 4.17; 

// 시스템 내부 상태 정의
let appState = {
    myFloor: 4,               // 현재 사용자가 탑승을 대기중인 위치 (왼쪽 상단 표시용)
    elevatorCurrentFloor: 12, // 엘리베이터의 현재 실시간 위치 (시작값은 사진처럼 12층)
    elevatorDirection: '↑',   // 현재 디스플레이에 노출되는 이동 방향 기호
    isProcessing: false,      // 호출 작동 중 중복 클릭 방지 플래그
    systemTimer: null         // 실시간 카운트다운 인터벌 저장소
};

// HTML 엘리먼트 정의
const elDisplayDirection = document.getElementById('display-direction');
const elDisplayFloor = document.getElementById('display-floor');
const elArrivalTime = document.getElementById('arrival-time-display');
const btnUp = document.getElementById('up-btn');
const btnDown = document.getElementById('down-btn');

// 초기 화면 설정 랜더링
function initDisplay() {
    elDisplayDirection.textContent = appState.elevatorDirection;
    elDisplayFloor.textContent = appState.elevatorCurrentFloor;
    elArrivalTime.textContent = ""; // 초기 상태는 텍스트 없음
}

// 두 층 사이의 실제 대기 시간을 데이터 기반으로 추출하는 계산 함수
function calculateWaitTime(fromFloor, toFloor) {
    if (BASE_TRAVEL_TIMES[fromFloor] !== undefined && BASE_TRAVEL_TIMES[toFloor] !== undefined) {
        // 데이터가 존재하는 1~8층 구간은 실측 데이터 간의 차이 절대값으로 정확히 계산
        return Math.abs(BASE_TRAVEL_TIMES[fromFloor] - BASE_TRAVEL_TIMES[toFloor]);
    } else {
        // 데이터 범위를 벗어나는 층(예: 12층)은 평균 층간 속도를 활용해 아날로그 계산
        return Math.abs(fromFloor - toFloor) * AVG_SPEED_PER_FLOOR;
    }
}

// 버튼 클릭 시 호출 이벤트 핸들러
function handleCallRequest(buttonDirection) {
    if (appState.isProcessing) return; // 이미 작동 중이면 작동 차단
    
    appState.isProcessing = true;
    
    // 버튼 시각 활성화 활성 상태 부여
    const targetButton = buttonDirection === 'up' ? btnUp : btnDown;
    targetButton.classList.add('active');

    // 사용자가 있는 4층까지 오기 위해 필요한 총 대기 시간 계산 (12층 -> 4층)
    let remainingTime = calculateWaitTime(appState.elevatorCurrentFloor, appState.myFloor);
    
    // 엘리베이터가 현재 사용자보다 위에 있으므로 아래로 내려와야 함을 표시
    appState.elevatorDirection = '↓';
    elDisplayDirection.textContent = appState.elevatorDirection;

    // 0.1초 단위 실시간 업데이트 루프 가동
    const updateInterval = 100; 
    const startFloor = appState.elevatorCurrentFloor;
    const targetFloor = appState.myFloor;
    const totalDuration = remainingTime;

    appState.systemTimer = setInterval(() => {
        remainingTime -= (updateInterval / 1000);

        if (remainingTime <= 0) {
            // 목적지(4층) 도달 완료 시점 처리
            clearInterval(appState.systemTimer);
            
            elDisplayFloor.textContent = "04";
            elArrivalTime.textContent = "0.00초 후\n도착";
            
            // 승강기 문 열림 연출 후 시스템 리셋 프로세스
            setTimeout(() => {
                elArrivalTime.textContent = "";
                targetButton.classList.remove('active');
                appState.elevatorCurrentFloor = appState.myFloor;
                appState.elevatorDirection = '↑'; // 기본 대기 상태 방향 전환
                appState.isProcessing = false;
                initDisplay();
            }, 2500);
            return;
        }

        // 실시간 잔여 초 화면 출력 (소수점 2자리 포맷팅)
        elArrivalTime.textContent = `${remainingTime.toFixed(2)}초 후\n도착`;

        // 진행 시간에 비례하여 디스플레이상의 엘리베이터 층수를 부드럽게 감소 연출
        let progress = 1 - (remainingTime / totalDuration);
        let currentEstimatedFloor = startFloor - (startFloor - targetFloor) * progress;
        
        elDisplayFloor.textContent = String(Math.round(currentEstimatedFloor)).padStart(2, '0');

    }, updateInterval);
}

// 이벤트 리스너 바인딩
btnUp.addEventListener('click', () => handleCallRequest('up'));
btnDown.addEventListener('click', () => handleCallRequest('down'));

// 초기 구동
initDisplay();

// 제공해주신 1층 기준 각 층 누적 도달시간 정밀 데이터셋 매핑
const ACCURATE_SPEED_DATA = {
    1: 0.00,
    2: 9.02,
    3: 12.01,
    4: 16.31,
    5: 19.88,
    6: 22.27,
    7: 25.84,
    8: 29.25
};

let deviceState = {
    elevatorFloor: 1,      // 초기 엘리베이터 정차 위치 (1층 기본 세팅)
    isOperating: false,
    timerInterval: null,
    stepInterval: null
};

// DOM 하드웨어 요소 구조 바인딩
const uiArrow = document.getElementById('display-arrow');
const uiNumber = document.getElementById('display-number');
const uiTimer = document.getElementById('display-timer');
const upButton = document.getElementById('btn-up');
const downButton = document.getElementById('btn-down');
const floorPicker = document.getElementById('floor-picker');

function refreshPanelLayout() {
    uiNumber.textContent = String(deviceState.elevatorFloor).padStart(2, '0');
}

// 엘리베이터 호출 기전 가동 엔진 함수
function processCallSignal(dirType) {
    if (deviceState.isOperating) return;

    // 왼쪽 상단 CURRENT FLOOR 셀렉터 박스에서 탑승객 위치 데이터 동적 수집
    const userTargetFloor = parseInt(floorPicker.value);

    // 예외 검출: 이미 해당 층에 대기 완료되어 움직일 필요가 없을 때
    if (deviceState.elevatorFloor === userTargetFloor) {
        uiTimer.textContent = "이미 현재 층에\n대기중입니다.";
        setTimeout(() => uiTimer.textContent = "", 2000);
        return;
    }

    deviceState.isOperating = true;
    
    // 타겟 물리 버튼 등 켜짐 활성화 연출
    const clickedButton = dirType === 'up' ? upButton : downButton;
    clickedButton.classList.add('active');

    // 시간 규격 필드 연산하여 총 주행할 정밀 잔여 시간 초단위 도출
    const initialFloorSec = ACCURATE_SPEED_DATA[deviceState.elevatorFloor];
    const destinationFloorSec = ACCURATE_SPEED_DATA[userTargetFloor];
    let remainSeconds = Math.abs(destinationFloorSec - initialFloorSec);
    const totalMoveDuration = remainSeconds;

    // 주행 흐름 레이블 화살표 정의 출력
    const arrowSymbol = userTargetFloor > deviceState.elevatorFloor ? '↑' : '↓';
    uiArrow.textContent = arrowSymbol;

    const sourceFloor = deviceState.elevatorFloor;
    const endFloor = userTargetFloor;

    // 1. 블랙 스크린 하단 영역 실시간 소수점 카운트다운 타이머 인터벌 (50ms 단위 루프)
    const clockTick = 50;
    deviceState.timerInterval = setInterval(() => {
        remainSeconds -= (clockTick / 1000);

        if (remainSeconds <= 0) {
            clearInterval(deviceState.timerInterval);
            clearInterval(deviceState.stepInterval);

            // 목적지 안전 정착 동기화 처리
            deviceState.elevatorFloor = endFloor;
            refreshPanelLayout();
            uiArrow.textContent = "─";
            uiTimer.textContent = "0.00초 뒤\n도착 완료";

            // 도어 오픈 연출 대기 후 시스템 리셋 및 락 해제
            setTimeout(() => {
                uiTimer.textContent = "";
                clickedButton.classList.remove('active');
                deviceState.isOperating = false;
            }, 2500);
            return;
        }

        // 스케치 지령서 요구사항 규격대로 텍스트 출력 사출
        uiTimer.textContent = `${remainSeconds.toFixed(2)}초 뒤\n뒤 도착`;
    }, clockTick);

    // 2. 아날로그 느낌을 극대화한 실시간 층수 게이지 1칸씩 순차 누진 이동 알고리즘
    const floorsCount = Math.abs(endFloor - sourceFloor);
    const intervalTimePerFloor = (totalMoveDuration / floorsCount) * 1000;

    deviceState.stepInterval = setInterval(() => {
        if (deviceState.elevatorFloor !== endFloor) {
            deviceState.elevatorFloor += (endFloor > sourceFloor) ? 1 : -1;
            refreshPanelLayout();
        } else {
            clearInterval(deviceState.stepInterval);
        }
    }, intervalTimePerFloor);
}

// 클릭 신호 인터페이스 바인딩
upButton.addEventListener('click', () => processCallSignal('up'));
downButton.addEventListener('click', () => processCallSignal('down'));

// 시스템 콜 초기 부팅 가동
refreshPanelLayout();

// 제공해주신 1층 기준 8층 구간 전용 정밀 실측 이동 타임 테이블 데이터셋
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
    elevatorFloor: 1,      // 승강기 초기 대기 위치 (1층 기본 출발)
    isOperating: false,
    timerInterval: null,
    stepInterval: null
};

// UI 컴포넌트 인터페이스 캐싱
const uiArrow = document.getElementById('display-arrow');
const uiNumber = document.getElementById('display-number');
const uiTimer = document.getElementById('display-timer');
const upButton = document.getElementById('btn-up');
const downButton = document.getElementById('btn-down');
const floorPicker = document.getElementById('floor-picker');

function refreshPanelLayout() {
    uiNumber.textContent = String(deviceState.elevatorFloor).padStart(2, '0');
}

// 엘리베이터 이동 지령 메인 관제 함수
function processCallSignal(dirType) {
    if (deviceState.isOperating) return;

    // 왼쪽 상단 드롭다운에서 선택된 실시간 탑승자 현재 대기 층값 로드
    const userTargetFloor = parseInt(floorPicker.value);

    // 사용자가 현재 엘리베이터가 서있는 위치와 같은 층수를 불렀을 때 즉시 예외처리
    if (deviceState.elevatorFloor === userTargetFloor) {
        uiTimer.textContent = "이미 현재 층에\n대기중입니다.";
        setTimeout(() => uiTimer.textContent = "", 2000);
        return;
    }

    deviceState.isOperating = true;
    
    // 버튼 오렌지 백라이트 등 점등 작동
    const clickedButton = dirType === 'up' ? upButton : downButton;
    clickedButton.classList.add('active');

    // 영수증 이미지 데이터 세트 간 오차를 빼내 이동에 걸리는 순수 잔여 초 도출
    const initialFloorSec = ACCURATE_SPEED_DATA[deviceState.elevatorFloor];
    const destinationFloorSec = ACCURATE_SPEED_DATA[userTargetFloor];
    let remainSeconds = Math.abs(destinationFloorSec - initialFloorSec);
    const totalMoveDuration = remainSeconds;

    // 움직이는 이동 목적지에 따른 상하 LED 화살표 기호 갱신
    const arrowSymbol = userTargetFloor > deviceState.elevatorFloor ? '↑' : '↓';
    uiArrow.textContent = arrowSymbol;

    const sourceFloor = deviceState.elevatorFloor;
    const endFloor = userTargetFloor;

    // 1. 검은색 화면 하단에 소수점 2자리로 카운트다운을 전개하는 루프 엔진 (0.05초 단위)
    const clockTick = 50;
    deviceState.timerInterval = setInterval(() => {
        remainSeconds -= (clockTick / 1000);

        if (remainSeconds <= 0) {
            clearInterval(deviceState.timerInterval);
            clearInterval(deviceState.stepInterval);

            // 해당 타겟 층 안착 및 완료 이벤트 시그널 전개
            deviceState.elevatorFloor = endFloor;
            refreshPanelLayout();
            uiArrow.textContent = "─";
            uiTimer.textContent = "0.00초 뒤\n도착 완료";

            // 문이 열리는 시간을 대기한 뒤 버튼 라이트 소등 및 락 해제
            setTimeout(() => {
                uiTimer.textContent = "";
                clickedButton.classList.remove('active');
                deviceState.isOperating = false;
            }, 2500);
            return;
        }

        // 사용자가 스케치해준 서식 형태 그대로 블랙 스크린에 반영 출력
        uiTimer.textContent = `${remainSeconds.toFixed(2)}초 뒤\n뒤 도착`;
    }, clockTick);

    // 2. 진짜 엘리베이터처럼 실시간 숫자가 순차적으로 차례대로 변하며 이동하는 등속 알고리즘
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

// 마우스 클릭 이벤트 트리거 연동
upButton.addEventListener('click', () => processCallSignal('up'));
downButton.addEventListener('click', () => processCallSignal('down'));

// 초기 셋업 빌드 구동
refreshPanelLayout();

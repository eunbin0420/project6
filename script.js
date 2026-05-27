// 업로드해주신 영수증 이미지의 실제 1층 기준 측정 규격 시간 데이터 셋 (1F ~ 8F)
const STEP_TIME_TABLE = {
    1: 0.00,
    2: 9.02,
    3: 12.01,
    4: 16.31,
    5: 19.88,
    6: 22.27,
    7: 25.84,
    8: 29.25
};

let elevatorController = {
    virtualFloor: 1,      // 승강기 초기 대기 층수 (1층 시작)
    isActive: false,
    timerCore: null,
    moveCore: null
};

// 물리 매핑 인터페이스 개체 노출
const elArrow = document.getElementById('display-arrow');
const elNum = document.getElementById('display-number');
const elTimer = document.getElementById('display-timer');
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const floorPicker = document.getElementById('floor-picker');

function renderSystemPanel() {
    elNum.textContent = String(elevatorController.virtualFloor).padStart(2, '0');
}

// 동작 가동 허브 제어 장치
function onCallSignal(actionDir) {
    if (elevatorController.isActive) return;

    // [변경] 사용자가 왼쪽 상단 드롭다운으로 실시간 변경한 층수 값 수집
    const assignedUserFloor = parseInt(floorPicker.value);

    // 사용자가 고른 층에 승강기가 대기 완료 중일 때 인터셉트 예외처리
    if (elevatorController.virtualFloor === assignedUserFloor) {
        elTimer.textContent = "이미 해당 층에\n위치해 있습니다.";
        setTimeout(() => elTimer.textContent = "", 2000);
        return;
    }

    elevatorController.isActive = true;
    
    // 클릭한 타겟 하드웨어 조명 작동
    const clickedBtn = actionDir === 'up' ? btnUp : btnDown;
    clickedBtn.classList.add('active');

    // 실측 데이터 필드값을 토대로 이동에 드는 총 구간 절대 잔여 시간 도출
    const startWeight = STEP_TIME_TABLE[elevatorController.virtualFloor];
    const endWeight = STEP_TIME_TABLE[assignedUserFloor];
    let countdownClock = Math.abs(endWeight - startWeight);
    const flightDuration = countdownClock;

    // 운행 방향 레이블 화살표 정의
    const calculatedDir = assignedUserFloor > elevatorController.virtualFloor ? '↑' : '↓';
    elArrow.textContent = calculatedDir;

    const sourceFloor = elevatorController.virtualFloor;
    const targetFloor = assignedUserFloor;

    // 1. 유리 액정 하단부 0.01초 단위 전개식 실시간 초 계측 루프 엔진
    const timeFrame = 50;
    elevatorController.timerCore = setInterval(() => {
        countdownClock -= (timeFrame / 1000);

        if (countdownClock <= 0) {
            clearInterval(elevatorController.timerCore);
            clearInterval(elevatorController.moveCore);

            // 타겟 위치 안전 정착 동기화
            elevatorController.virtualFloor = targetFloor;
            renderSystemPanel();
            elArrow.textContent = "─";
            elTimer.textContent = "0.00초 뒤\n도착 완료";

            // 도어 개방 시간 확보용 임시 락 타임아웃
            setTimeout(() => {
                elTimer.textContent = "";
                clickedBtn.classList.remove('active');
                elevatorController.isActive = false;
            }, 2500);
            return;
        }

        // 스케치 노트 설계 데이터 완벽 이식 출력
        elTimer.textContent = `${countdownClock.toFixed(2)}초 뒤\n뒤 도착`;
    }, timeFrame);

    // 2. 실제 엘리베이터처럼 층수 눈금이 순차적으로 등간격 점등하며 이동하는 기법
    const totalFloorsToCross = Math.abs(targetFloor - sourceFloor);
    const tickInterval = (flightDuration / totalFloorsToCross) * 1000;

    elevatorController.moveCore = setInterval(() => {
        if (elevatorController.virtualFloor !== targetFloor) {
            elevatorController.virtualFloor += (targetFloor > sourceFloor) ? 1 : -1;
            renderSystemPanel();
        } else {
            clearInterval(elevatorController.moveCore);
        }
    }, tickInterval);
}

// 이벤트 인터커넥트 바인딩
btnUp.addEventListener('click', () => onCallSignal('up'));
btnDown.addEventListener('click', () => onCallSignal('down'));

// 공장 초기 부팅 전개
renderSystemPanel();

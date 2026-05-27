// 실측 데이터 반영 (1층부터 최대 8층까지 고정)
const EXPEDITION_DATA = {
    1: 0.00,
    2: 9.02,
    3: 12.01,
    4: 16.31,
    5: 19.88,
    6: 22.27,
    7: 25.84,
    8: 29.25
};

let liftState = {
    userLocation: 4,         // 현재 탑승객 대기 위치 (4층 고정)
    currentFloor: 1,         // 엘리베이터 현재 출발 위치 (현실감 있게 1층부터 시작)
    isMoving: false,
    globalTimer: null,
    floorSwitcher: null
};

// DOM 바인딩
const elDirection = document.getElementById('display-direction');
const elFloor = document.getElementById('display-floor');
const elArrival = document.getElementById('arrival-time-display');
const btnUp = document.getElementById('up-btn');
const btnDown = document.getElementById('down-btn');

function updateHardwareDisplay() {
    elFloor.textContent = String(liftState.currentFloor).padStart(2, '0');
}

// 호출 동작 핵심 비즈니스 로직
function requestElevator(btnType) {
    if (liftState.isMoving) return;
    
    // 현재 엘리베이터가 이미 4층에 있다면 대기 시간 없음 처리
    if (liftState.currentFloor === liftState.userLocation) {
        elArrival.textContent = "이미 해당 층에\n도착해 있습니다.";
        setTimeout(() => elArrival.textContent = "", 2000);
        return;
    }

    liftState.isMoving = true;
    
    // 버튼 불빛 ON 활성화
    const activeBtn = btnType === 'up' ? btnUp : btnDown;
    activeBtn.classList.add('active');

    // 출발층과 목적층(4층) 사이의 실제 소요시간 계산
    const startTime = EXPEDITION_DATA[liftState.currentFloor];
    const endTime = EXPEDITION_DATA[liftState.userLocation];
    let timeRemaining = Math.abs(endTime - startTime);
    const totalDuration = timeRemaining;

    // 이동 방향 기호 판별 및 출력
    const moveDirection = liftState.userLocation > liftState.currentFloor ? '↑' : '↓';
    elDirection.textContent = moveDirection;

    const startFloor = liftState.currentFloor;
    const targetFloor = liftState.userLocation;

    // 1. 실시간 대기시간 카운트다운 루프 (0.05초 단위 정밀 갱신)
    const tickRate = 50;
    liftState.globalTimer = setInterval(() => {
        timeRemaining -= (tickRate / 1000);

        if (timeRemaining <= 0) {
            clearInterval(liftState.globalTimer);
            clearInterval(liftState.floorSwitcher);
            
            // 최종 안착 상태 초기화 및 세팅
            liftState.currentFloor = targetFloor;
            updateHardwareDisplay();
            elDirection.textContent = "─";
            elArrival.textContent = "0.00초 후\n도착완료";
            
            // 문 열림 대기 후 원상태 복귀 연출
            setTimeout(() => {
                elArrival.textContent = "";
                activeBtn.classList.remove('active');
                liftState.isMoving = false;
            }, 3000);
            return;
        }

        elArrival.textContent = `${timeRemaining.toFixed(2)}초 후\n도착`;
    }, tickRate);

    // 2. [핵심] 실제 엘리베이터처럼 층수 숫자를 한 칸씩 순차 이동 연출하는 타이머
    // 전체 남은 시간에 비례하여 등간격으로 숫자가 변경됨
    const totalFloorsToMove = Math.abs(targetFloor - startFloor);
    const timePerFloor = (totalDuration / totalFloorsToMove) * 1000; // 한 층 올라가는데 걸리는 ms 계산

    liftState.floorSwitcher = setInterval(() => {
        if (liftState.currentFloor !== targetFloor) {
            // 방향에 따라 1층씩 점진적 증감
            liftState.currentFloor += (targetFloor > startFloor) ? 1 : -1;
            updateHardwareDisplay();
        } else {
            clearInterval(liftState.floorSwitcher);
        }
    }, timePerFloor);
}

// 리스너 연동
btnUp.addEventListener('click', () => requestElevator('up'));
btnDown.addEventListener('click', () => requestElevator('down'));

// 초기 세팅 가동
updateHardwareDisplay();

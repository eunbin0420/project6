// 영수증 이미지 제공 실측 데이터 세트 반영 (1층 기준 각 층 소요 누적시간)
const TIME_DATA = {
    1: 0.00,
    2: 9.02,
    3: 12.01,
    4: 16.31,
    5: 19.88,
    6: 22.27,
    7: 25.84,
    8: 29.25
};

let systemState = {
    currentFloor: 1,      // 엘리베이터 시작 위치 (현실감 있게 1층부터 출발)
    isMoving: false,
    mainTimer: null,
    floorTimer: null
};

// 요소 셀렉터 바인딩
const elArrow = document.getElementById('arrow');
const elFloorNum = document.getElementById('floor-num');
const elCountdown = document.getElementById('countdown-display');
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const selectFloor = document.getElementById('floor-select');

// 디스플레이 초기화 함수
function refreshDisplay() {
    elFloorNum.textContent = String(systemState.currentFloor).padStart(2, '0');
}

// 핵심 구동 알고리즘 함수
function callElevator(clickedDirection) {
    if (systemState.isMoving) return;

    // 실시간 동적 내 위치 설정 획득
    const myFloor = parseInt(selectFloor.value);

    // 예외 상황 처리: 이미 해당 층에 서 있을 경우
    if (systemState.currentFloor === myFloor) {
        elCountdown.textContent = "이미 해당 층에\n있습니다.";
        setTimeout(() => elCountdown.textContent = "", 2000);
        return;
    }

    systemState.isMoving = true;
    
    // 타겟 버튼에 활성화 클래스(빛 효과) 부여
    const targetButton = clickedDirection === 'up' ? btnUp : btnDown;
    targetButton.classList.add('active');

    // 실측 데이터 간 차이 절대값으로 총 소요시간 자동 환산
    const startTime = TIME_DATA[systemState.currentFloor];
    const endTime = TIME_DATA[myFloor];
    let remainingTime = Math.abs(endTime - startTime);
    const totalDuration = remainingTime;

    // 움직이는 진행 방향성 기호 확정
    const directionIndicator = myFloor > systemState.currentFloor ? '↑' : '↓';
    elArrow.textContent = directionIndicator;

    const startFloor = systemState.currentFloor;
    const targetFloor = myFloor;

    // 1. 디스플레이 하단 초 단위 카운트다운 가동 (0.05초 단위 부드러운 순환)
    const tick = 50;
    systemState.mainTimer = setInterval(() => {
        remainingTime -= (tick / 1000);

        if (remainingTime <= 0) {
            clearInterval(systemState.mainTimer);
            clearInterval(systemState.floorTimer);

            // 도착 완료 시점 디스플레이 동기화
            systemState.currentFloor = targetFloor;
            refreshDisplay();
            elArrow.textContent = "─";
            elCountdown.textContent = "0.00초 뒤\n도착 완료";

            // 문 열림 상태 유지 후 원상 복귀 리셋 프로세스
            setTimeout(() => {
                elCountdown.textContent = "";
                targetButton.classList.remove('active');
                systemState.isMoving = false;
            }, 3000);
            return;
        }

        // 사용자가 스케치해 준 양식 그대로 출력 적용
        elCountdown.textContent = `${remainingTime.toFixed(2)}초 뒤\n도착`;
    }, tick);

    // 2. 진짜 엘리베이터처럼 실시간 층수가 차례대로 바뀌며 올라가는 연출
    const totalFloorsToMove = Math.abs(targetFloor - startFloor);
    // 각 구간의 정밀 실측 기반 한 층당 주행 인터벌 계산
    const intervalPerFloor = (totalDuration / totalFloorsToMove) * 1000;

    systemState.floorTimer = setInterval(() => {
        if (systemState.currentFloor !== targetFloor) {
            systemState.currentFloor += (targetFloor > startFloor) ? 1 : -1;
            refreshDisplay();
        } else {
            clearInterval(systemState.floorTimer);
        }
    }, intervalPerFloor);
}

// 버튼 클릭 이벤트 리스너 할당
btnUp.addEventListener('click', () => callElevator('up'));
btnDown.addEventListener('click', () => callElevator('down'));

// 최초 기기 랜더링 실행
refreshDisplay();

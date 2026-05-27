// 실제 측정 이동 시간 데이터
const moveTime = {
    2: 9.02,
    3: 12.01,
    4: 16.31,
    5: 19.88,
    6: 22.27,
    7: 25.84,
    8: 29.25
};

// 버튼 눌렀을 때
function callElevator(isFastClose){

    // 선택 층
    const floor =
        document.getElementById("floor").value;

    // 이동 시간
    const elevatorTime =
        moveTime[floor];

    // 문 닫힘 시간
    let doorTime;

    // ▲ 버튼
    if(isFastClose){
        doorTime = 8.60;
    }

    // ▼ 버튼
    else{
        doorTime = 17.22;
    }

    // 총 시간 계산
    const totalTime =
        elevatorTime + doorTime;

    // 화면 표시
    document.getElementById("display").innerHTML =
        Math.round(totalTime) +
        "<br>초";
}

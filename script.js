let currentFloor = 1;
let doorCloseFast = true;

// 교수님 피드백 반영: 실제 측정 데이터 기반
const moveTimeData = {
  2: 9.02,
  3: 12.01,
  4: 16.31,
  5: 19.88,
  6: 22.27,
  7: 25.84,
  8: 29.25
};

function selectFloor(targetFloor) {
  let doorTime = doorCloseFast ? 8.60 : 17.22;

  let moveTime = moveTimeData[targetFloor];

  // 도착시간 = 이동시간 + 문 열림/닫힘 시간
  let arrivalTime = moveTime + doorTime;

  document.getElementById("currentFloor").innerText = currentFloor + "층";
  document.getElementById("arrivalTime").innerText = arrivalTime.toFixed(2) + "초";
}

function toggleDoorTime() {
  doorCloseFast = !doorCloseFast;

  let doorText = doorCloseFast
    ? "문 열림/닫힘 시간: 8.60초"
    : "문 열림/닫힘 시간: 17.22초";

  document.getElementById("doorInfo").innerText = doorText;
}

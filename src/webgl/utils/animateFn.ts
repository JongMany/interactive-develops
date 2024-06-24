/**
 * Easing functions
 * @function easeOutSine
 * @param {number} time - 현재 시간. 애니메이션 시작 후 흐른 시간
 * @param {number} beginValue - 애니메이션 시작 값. 애니메이션이 시작할 때의 초기값
 * @param {number} changeInValue - 애니메이션 값의 변화량. 애니메이션이 종료될 때까지 변화해야 하는 값의 양
 * @param {number} duration - 애니메이션 총 지속 시간. 애니메이션이 완료되기까지의 전체 시간
 */
export const easeOutSine = (
  time: number,
  beginValue: number,
  changeInValue: number,
  duration: number
) => {
  return (
    changeInValue * Math.sin((time / duration) * (Math.PI / 2)) + beginValue
  );
};

/**
 * Ease Out functions
 * @function easeOutSine
 * @param {number} time - 현재 시간. 애니메이션 시작 후 흐른 시간
 * @param {number} beginValue - 애니메이션 시작 값. 애니메이션이 시작할 때의 초기값
 * @param {number} changeInValue - 애니메이션 값의 변화량. 애니메이션이 종료될 때까지 변화해야 하는 값의 양
 * @param {number} duration - 애니메이션 총 지속 시간. 애니메이션이 완료되기까지의 전체 시간
 */
export const easeOutQuad = (
  time: number,
  beginValue: number,
  changeInValue: number,
  duration: number
) => {
  time /= duration;
  return -changeInValue * time * (time - 2) + beginValue;
};

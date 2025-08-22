// フェーズ1：ダミーの「擬似文字起こし」生成
import { startDummyTranscript, stopDummyTranscript } from "./transcript.js";
export function startMockRecognition() {
  startDummyTranscript();
}
export function stopMockRecognition() {
  stopDummyTranscript();
}

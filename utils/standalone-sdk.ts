/** Local lifecycle adapter: standalone play never contacts the Playground host. */
export class StandaloneGameSDK {
  startGame() {}
  scoreUpdated(_score: { value: number; level: string }) {}
  gameOver() {}
  levelComplete(_level: number | string) {}
  pauseStateChanged(_paused: boolean) {}
}

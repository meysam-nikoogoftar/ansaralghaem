export interface ShrineRenderer {
  render: (seconds: number) => boolean
  dispose: () => void
}

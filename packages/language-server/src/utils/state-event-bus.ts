type StateEventBusCallback = (...args: any[]) => any

export class StateEventBus {
  private states: Map<String, [boolean, any[]]> = new Map()
  private events: Map<String, StateEventBusCallback[]> = new Map()

  public on(name: string, callback?: any) {
    if (!this.states.has(name)) {
      this.states.set(name, [false, []])
      this.events.set(name, [])
    }

    const [fin, args] = this.states.get(name)!
    if (callback) {
      if (fin)
        callback(args)

      else
        this.events.get(name)!.push(callback)
    }
  }

  public wait(name: string) {
    return new Promise((resolve) => {
      this.on(name, resolve)
    })
  }

  public finish(name: string, ...args: any[]) {
    if (this.states.has(name)) {
      this.states.set(name, [true, args])
      this.events.set(
        name,
        this.events.get(name)!.filter(e => e(args), false),
      )
    }
  }

  public isFinished(name: string): boolean {
    const g = this.states.get(name)
    return !!g && !!g[0]
  }

  public revoke(name: string) {
    if (!this.states.has(name) || this.states.get(name))
      this.on(name)
  }

  public reset() {
    this.states.clear()
    this.events.clear()
  }
}

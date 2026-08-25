/**
 * Hält eine einmalige Eingabe fest, bis die feste Simulation sie tatsächlich
 * konsumiert. Dadurch kann eine Taste nicht zwischen zwei Simulationsschritten
 * verloren gehen.
 */
export class OneShotInputBuffer {
  private pending = false;

  public get hasPending(): boolean {
    return this.pending;
  }

  public queue(): void {
    this.pending = true;
  }

  public consume(): boolean {
    const result = this.pending;
    this.pending = false;
    return result;
  }

  public clear(): void {
    this.pending = false;
  }
}

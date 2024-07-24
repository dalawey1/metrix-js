import { Labels, Metric } from "./metric";

export class Gauge extends Metric {
    set(value: number, labels: Labels = {}): void {
      const key = this.getLabelsKey(labels);
      this.labelValues.set(key, value);
    }
  
    inc(amount: number = 1, labels: Labels = {}): void {
      const key = this.getLabelsKey(labels);
      this.labelValues.set(key, (this.labelValues.get(key) || 0) + amount);
    }
  
    dec(amount: number = 1, labels: Labels = {}): void {
      const key = this.getLabelsKey(labels);
      this.labelValues.set(key, (this.labelValues.get(key) || 0) - amount);
    }
  
    get(labels: Labels = {}): number {
      const key = this.getLabelsKey(labels);
      return this.labelValues.get(key) || 0;
    }
  }
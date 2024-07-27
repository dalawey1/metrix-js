import { Labels, Metric } from "./metric";

export class Counter extends Metric {
  inc(amount: number = 1, labels: Labels = {}): void {
    const key = this.getLabelsKey(labels);
    this.labelValues.set(key, (this.labelValues.get(key) || 0) + amount);
  }

  get(labels: Labels = {}): number {
    const key = this.getLabelsKey(labels);
    return this.labelValues.get(key) || 0;
  }

  getMetricString(): string {
    let output = `# HELP ${this.name} ${this.help}\n`;
    output += `# TYPE ${this.name} counter\n`;
    this.labelValues.forEach((value, labelKey) => {
      const labels = JSON.parse(labelKey);
      const labelStr = labels.map((val: string, idx: number) => `${this.labelNames[idx]}="${val}"`).join(',');
      output += `${this.name}{${labelStr}} ${value}\n`;
    });
    return output;
  }
}

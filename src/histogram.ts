import { Labels, Metric } from "./metric";

export class Histogram extends Metric {
  private buckets: Map<string, Map<number, number>> = new Map();
  private sums: Map<string, number> = new Map();
  private counts: Map<string, number> = new Map();

  constructor(name: string, help: string, private bucketBounds: number[], labels: string[] = []) {
    super(name, help, labels);
  }

  observe(value: number, labels: Labels = {}): void {
    const key = this.getLabelsKey(labels);

    if (!this.buckets.has(key)) {
      this.buckets.set(key, new Map(this.bucketBounds.map(bound => [bound, 0])));
      this.sums.set(key, 0);
      this.counts.set(key, 0);
    }

    const buckets = this.buckets.get(key)!;
    for (const [bound, count] of buckets) {
      if (value <= bound) {
        buckets.set(bound, count + 1);
      }
    }

    this.sums.set(key, (this.sums.get(key) || 0) + value);
    this.counts.set(key, (this.counts.get(key) || 0) + 1);
  }

  get(labels: Labels = {}): { buckets: Map<number, number>; sum: number; count: number } {
    const key = this.getLabelsKey(labels);
    return {
      buckets: this.buckets.get(key) || new Map(),
      sum: this.sums.get(key) || 0,
      count: this.counts.get(key) || 0,
    };
  }

  getMetricString(): string {
    let output = `# HELP ${this.name} ${this.help}\n`;
    output += `# TYPE ${this.name} histogram\n`;
    this.buckets.forEach((buckets, labelKey) => {
      const labels = JSON.parse(labelKey);
      const labelStr = labels.map((val: string, idx: number) => `${this.labelNames[idx]}="${val}"`).join(',');
      buckets.forEach((count, bound) => {
        output += `${this.name}_bucket{${labelStr},le="${bound}"} ${count}\n`;
      });
      output += `${this.name}_sum{${labelStr}} ${this.sums.get(labelKey)}\n`;
      output += `${this.name}_count{${labelStr}} ${this.counts.get(labelKey)}\n`;
    });
    return output;
  }
}

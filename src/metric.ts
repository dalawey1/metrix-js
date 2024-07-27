export type Labels = { [key: string]: string };

export abstract class Metric {
  protected labelNames: string[];
  protected labelValues: Map<string, number> = new Map();

  constructor(protected name: string, protected help: string, labels: string[] = []) {
    this.labelNames = labels;
  }

  abstract getMetricString(): string; 

  protected getLabelsKey(labels: Labels): string {
    return JSON.stringify(
      this.labelNames.map(name => labels[name] || '')
    );
  }
}
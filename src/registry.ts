import {  Metric } from "./metric";
import {  Counter } from "./counter";
import {  Gauge } from "./gauge";
import {Histogram } from "./histogram";

export class Registry {
    private metrics: Map<string, Metric> = new Map();
  
    registerCounter(name: string, help: string, labels: string[] = []): Counter {
      const counter = new Counter(name, help, labels);
      this.metrics.set(name, counter);
      return counter;
    }
  
    registerGauge(name: string, help: string, labels: string[] = []): Gauge {
      const gauge = new Gauge(name, help, labels);
      this.metrics.set(name, gauge);
      return gauge;
    }
  
    registerHistogram(name: string, help: string, bucketBounds: number[], labels: string[] = []): Histogram {
      const histogram = new Histogram(name, help, bucketBounds, labels);
      this.metrics.set(name, histogram);
      return histogram;
    }
  
    getMetrics(): string {
      return Array.from(this.metrics.values()).map(metric => metric.getMetricString()).join('\n');
    }
  
    reset(): void {
      for (const metric of this.metrics.values()) {
        if (metric instanceof Counter || metric instanceof Gauge) {
          metric['labelValues'].clear();
        } else if (metric instanceof Histogram) {
          metric['buckets'].clear();
          metric['sums'].clear();
          metric['counts'].clear();
        }
      }
    }
  
    clear(): void {
      this.metrics.clear();
    }
  }
  
  export const defaultRegistry = new Registry();
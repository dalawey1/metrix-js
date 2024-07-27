// File: src/__tests__/metrics.test.ts

import { Counter } from '../src/counter';
import { Gauge } from '../src/gauge';
import { Histogram } from '../src/histogram';
import { Registry } from '../src/registry';


describe('Counter', () => {
    let counter: Counter;

    beforeEach(() => {
        counter = new Counter('http_requests_total',
            'Total number of HTTP requests',
            ['method', 'status']);
    });

    test('should increment by 1 by default', () => {
        counter.inc();
        expect(counter.get()).toBe(1);
    });

    test('should increment by given amount', () => {
        counter.inc(5);
        expect(counter.get()).toBe(5);
    });

    test('should handle labels', () => {
        counter.inc(1, { method: 'GET', status: '200' });
        counter.inc(2, { method: 'POST', status: '201' });
        expect(counter.get({ method: 'GET', status: '200' })).toBe(1);
        expect(counter.get({ method: 'POST', status: '201' })).toBe(2);
    });

    test('should generate correct metric string', () => {
        counter.inc(1, { method: 'GET' });
        counter.inc(2, { method: 'POST' });
        const metricString = counter.getMetricString();
        expect(metricString).toContain('HELP http_requests_total Total number of HTTP requests');
        expect(metricString).toContain('# TYPE http_requests_total counter');
        expect(metricString).toContain('http_requests_total{method="GET",status=""} 1');
        expect(metricString).toContain('http_requests_total{method="POST",status=""} 2');
    });
});

describe('Gauge', () => {
    let gauge: Gauge;

    beforeEach(() => {
        gauge = new Gauge('test_gauge', 'Test gauge', ['method', 'status']);
    });

    test('should set value', () => {
        gauge.set(5);
        expect(gauge.get()).toBe(5);
    });

    test('should increment value', () => {
        gauge.set(5);
        gauge.inc(2);
        expect(gauge.get()).toBe(7);
    });

    test('should decrement value', () => {
        gauge.set(5);
        gauge.dec(2);
        expect(gauge.get()).toBe(3);
    });

    test('should handle labels', () => {
        gauge.set(5, { method: 'GET', status: '200' });
        gauge.set(10, { method: 'POST', status: '200' });
        expect(gauge.get({ method: 'GET', status: '200' })).toBe(5);
        expect(gauge.get({ method: 'POST', status: '200' })).toBe(10);
    });

    test('should generate correct metric string', () => {
        let gauge1 = new Gauge('test_gauge', 'Test gauge', ['method']);
        gauge1.set(5, { method: 'GET' });
        gauge1.set(10, { method: 'POST' });
        const metricString = gauge1.getMetricString();
        expect(metricString).toContain('# HELP test_gauge Test gauge');
        expect(metricString).toContain('# TYPE test_gauge gauge');
        expect(metricString).toContain('test_gauge{method="GET"} 5');
        expect(metricString).toContain('test_gauge{method="POST"} 10');
    });
});

describe('Histogram', () => {
    let histogram: Histogram;

    beforeEach(() => {
        histogram = new Histogram('test_histogram', 'Test histogram', [0.1, 0.5, 1], ['method', 'status']);
    });

    test('should observe values', () => {
        histogram.observe(0.2);
        histogram.observe(0.7);
        const data = histogram.get();
        expect(data.sum).toBeCloseTo(0.9, 5);
        expect(data.count).toBe(2);
        expect(data.buckets.get(0.1)).toBe(0);
        expect(data.buckets.get(0.5)).toBe(1);
        expect(data.buckets.get(1)).toBe(2);
    });

    test('should handle labels', () => {
        histogram.observe(0.2, { method: 'GET', status: '200' });
        histogram.observe(0.7, { method: 'POST', status: '200' });
        const getData = histogram.get({ method: 'GET', status: '200' });
        const postData = histogram.get({ method: 'POST', status: '200' });
        expect(getData.count).toBe(1);
        expect(postData.count).toBe(1);
    });

    test('should generate correct metric string', () => {
        let histogram1 = new Histogram('test_histogram', 'Test histogram', [0.1, 0.5, 1], ['method']);
        histogram1.observe(0.2, { method: 'GET' });
        histogram1.observe(0.7, { method: 'POST' });
        const metricString = histogram1.getMetricString();
        expect(metricString).toContain('# HELP test_histogram Test histogram');
        expect(metricString).toContain('# TYPE test_histogram histogram');
        expect(metricString).toContain('test_histogram_bucket{method="GET",le="0.1"} 0');
        expect(metricString).toContain('test_histogram_bucket{method="GET",le="0.5"} 1');
        expect(metricString).toContain('test_histogram_bucket{method="POST",le="1"} 1');
        expect(metricString).toContain('test_histogram_sum{method="GET"} 0.2');
        expect(metricString).toContain('test_histogram_sum{method="POST"} 0.7');
        expect(metricString).toContain('test_histogram_count{method="GET"} 1');
        expect(metricString).toContain('test_histogram_count{method="POST"} 1');
    });
});

describe('Registry', () => {
    let registry: Registry;

    beforeEach(() => {
        registry = new Registry();
    });

    test('should register and retrieve a counter', () => {
        const counter = registry.registerCounter('test_counter', 'Test counter');
        expect(counter).toBeInstanceOf(Counter);
        counter.inc(5);
        expect(counter.get()).toBe(5);
    });

    test('should register and retrieve a gauge', () => {
        const gauge = registry.registerGauge('test_gauge', 'Test gauge');
        expect(gauge).toBeInstanceOf(Gauge);
        gauge.set(10);
        expect(gauge.get()).toBe(10);
    });

    test('should register and retrieve a histogram', () => {
        const histogram = registry.registerHistogram('test_histogram', 'Test histogram', [0.1, 0.5, 1]);
        expect(histogram).toBeInstanceOf(Histogram);
        histogram.observe(0.2);
        expect(histogram.get().count).toBe(1);
    });

    test('should generate metrics for all registered metrics', () => {
        const counter = registry.registerCounter('test_counter', 'Test counter');
        const gauge = registry.registerGauge('test_gauge', 'Test gauge');
        const histogram = registry.registerHistogram('test_histogram', 'Test histogram', [0.1, 0.5, 1]);

        counter.inc(5);
        gauge.set(10);
        histogram.observe(0.2);

        const metrics = registry.getMetrics();
        expect(metrics).toContain('# HELP test_counter Test counter');
        expect(metrics).toContain('# TYPE test_counter counter');
        expect(metrics).toContain('test_counter{} 5');
        expect(metrics).toContain('# HELP test_gauge Test gauge');
        expect(metrics).toContain('# TYPE test_gauge gauge');
        expect(metrics).toContain('test_gauge{} 10');
        expect(metrics).toContain('# HELP test_histogram Test histogram');
        expect(metrics).toContain('# TYPE test_histogram histogram');
        expect(metrics).toContain('test_histogram_bucket{,le="0.1"} 0');
        expect(metrics).toContain('test_histogram_bucket{,le="0.5"} 1');
        expect(metrics).toContain('test_histogram_bucket{,le="1"} 1');
        expect(metrics).toContain('test_histogram_sum{} 0.2');
        expect(metrics).toContain('test_histogram_count{} 1');
    });

    test('should reset all metrics', () => {
        const counter = registry.registerCounter('test_counter', 'Test counter');
        const gauge = registry.registerGauge('test_gauge', 'Test gauge');
        const histogram = registry.registerHistogram('test_histogram', 'Test histogram', [0.1, 0.5, 1]);

        counter.inc(5);
        gauge.set(10);
        histogram.observe(0.2);

        registry.reset();

        expect(counter.get()).toBe(0);
        expect(gauge.get()).toBe(0);
        expect(histogram.get().count).toBe(0);
    });

    test('should clear all metrics', () => {
        registry.registerCounter('test_counter', 'Test counter');
        registry.registerGauge('test_gauge', 'Test gauge');
        registry.registerHistogram('test_histogram', 'Test histogram', [0.1, 0.5, 1]);

        registry.clear();

        expect(registry.getMetrics()).toBe('');
    });
});
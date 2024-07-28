# Your Metrics Package

A simple metrics package for web applications( Compatible with Angular, React and Vue) and Node.

## Installation

```bash
npm install metrica-js
```

## Usage

```typescript
import { Counter, Gauge, Histogram, defaultRegistry } from 'metrica-js';

// Create metrics
const counter = defaultRegistry.registerCounter('http_requests_total', 'Total HTTP requests');
const gauge = defaultRegistry.registerGauge('cpu_usage_percent', 'CPU usage percentage');
const histogram = defaultRegistry.registerHistogram('http_response_time_seconds', 'HTTP response time', [0.1, 0.3, 0.5, 1, 3, 5]);

// Use metrics
counter.inc();
gauge.set(42);
histogram.observe(0.2);

// Get metrics
console.log(defaultRegistry.getMetrics());
```

## License

MIT

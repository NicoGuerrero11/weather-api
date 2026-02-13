# Weather API Wrapper Service

A production-ready weather API wrapper service with Redis caching, Docker support, and real-time performance monitoring. Built as part of the [roadmap.sh Weather API project](https://roadmap.sh/projects/weather-api-wrapper-service).

## Features

- 🌤️ Fetch weather data for any city worldwide
- ⚡ Redis caching with **95-97% performance improvement** on cached requests
- 📊 Real-time cache statistics via `/stats` endpoint
- 🐳 Full Docker & Docker Compose support
- 🛡️ Graceful degradation when Redis is unavailable
- 🔒 Rate limiting (100 requests per 15 minutes)
- 🌍 Metric units support
- 🧪 Jest test suite included
- 🔑 Flexible environment configuration

## Tech Stack

- **Node.js 20** with Express 5
- **Redis 7** for in-memory caching
- **Docker & Docker Compose** for containerization
- **Axios** for HTTP requests
- **OpenWeather API** as data source
- **express-rate-limit** for request throttling
- **Jest + Supertest** for testing
- **pnpm** as package manager

## Project Structure

```
weather-api/
├── config/
│   ├── config.js          # Environment variables
│   └── redisClient.js     # Redis connection & cache stats
├── controllers/
│   └── weather.js         # Request handlers (weather + stats)
├── model/
│   └── weather.js         # Business logic & caching
├── routes/
│   └── weather.js         # API routes
├── tests/
│   ├── weather.test.js    # Weather endpoint tests
│   └── stats.test.js      # Stats endpoint tests
├── docker-compose.yml     # Multi-container setup
├── dockerfile             # Application container
├── jest.config.js         # Test configuration
└── main.js                # Application entry point
```

## Prerequisites

- Node.js v20+ (or Docker)
- pnpm (`npm install -g pnpm`)
- Redis server (or use Docker Compose)
- OpenWeather API key ([Get it here](https://openweathermap.org/api))

## Installation

### Option 1: Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd weather-api
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file (see `.env.example`):
```env
# Server
PORT=3000
NODE_ENV=development

# OpenWeather API
WEATHER_API_KEY=your_openweather_api_key

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=

# Cache
CACHE_TTL=3600
```

4. Start the server:
```bash
pnpm dev
```

> **Note:** This requires Redis running locally. Use Docker Compose instead for easier setup.

### Option 2: Docker Compose (Recommended)

1. Clone and configure:
```bash
git clone <repository-url>
cd weather-api
cp .env.example .env
# Edit .env with your WEATHER_API_KEY
```

2. Start all services:
```bash
docker-compose up -d
```

This starts:
- **weather-api** on `http://localhost:3000`
- **Redis** on port `6379`
- **Redis Commander** (GUI) on `http://localhost:8081`

## API Endpoints

### Get Weather

**GET** `/:city`

Fetch weather data for a specific city.

```bash
curl http://localhost:3000/London
```

**Response:**
```json
{
  "data": {
    "coord": { "lon": -0.1257, "lat": 51.5085 },
    "weather": [{ "main": "Clouds", "description": "overcast clouds" }],
    "main": {
      "temp": 12.5,
      "feels_like": 11.2,
      "humidity": 76
    },
    "name": "London"
  },
  "source": "api",
  "cached": false
}
```

### Get Cache Statistics

**GET** `/stats`

Get real-time cache performance metrics.

```bash
curl http://localhost:3000/stats
```

**Response:**
```json
{
  "cacheHits": 150,
  "cacheMisses": 23,
  "hitRate": "86.7%",
  "totalKeys": 45,
  "uptime": "2h 34m",
  "redisConnected": true,
  "errors": 0,
  "timestamp": "2026-02-11T19:00:00.000Z"
}
```

## How it Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        Request Flow                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Client ──► Express ──► Redis Check ──┬──► Cache HIT ──► Response
│                                       │    (~5-15ms)            │
│                                       │                         │
│                                       └──► Cache MISS           │
│                                            │                    │
│                                            ▼                    │
│                                       OpenWeather API           │
│                                            │                    │
│                                            ▼                    │
│                                       Cache Result (TTL: 1h)    │
│                                            │                    │
│                                            ▼                    │
│                                       Response (~300-500ms)     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

1. Client requests weather data for a city
2. System checks Redis cache for existing data
3. **Cache HIT**: Return cached data (~5-15ms)
4. **Cache MISS**: Fetch from OpenWeather API, cache result, return data (~300-500ms)

## Performance

| Scenario | Without Cache | With Cache | Improvement |
|----------|---------------|------------|-------------|
| First Request | ~300-500ms | ~300-500ms | N/A |
| Subsequent Requests | ~300-500ms | ~5-15ms | **95-97% faster** |
| 100 Requests (same city) | ~30-50s | ~0.5-1.5s | **97% faster** |

> See [performance.md](./performance.md) for detailed benchmarks and optimization guidelines.

## Testing

Run the test suite:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

## Rate Limiting

The API is protected with rate limiting:
- **100 requests** per **15 minutes** per IP address

## Resilience

The API is designed to continue functioning even if Redis fails:
- ✅ Automatic fallback to direct API calls
- ✅ No downtime if Redis is unavailable
- ✅ Error tracking via `/stats` endpoint
- ✅ Automatic reconnection attempts

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Start production server |
| `pnpm dev` | Start with file watching |
| `pnpm test` | Run test suite |
| `pnpm test:watch` | Run tests in watch mode |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `WEATHER_API_KEY` | OpenWeather API key | **Required** |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_USERNAME` | Redis username | `default` |
| `REDIS_PASSWORD` | Redis password | - |
| `CACHE_TTL` | Cache TTL in seconds | `3600` |

## License

ISC

## Author

⭐ Desarrollado con ❤️ por Nico Guerrero

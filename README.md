# Weather API Wrapper Service

A weather API wrapper service that fetches and caches weather data from Visual Crossing's Weather API. Built as part of the [roadmap.sh Weather API project](https://roadmap.sh/projects/weather-api-wrapper-service).

## Features

- 🌤️ Fetch weather data for any city
- ⚡ Redis caching for improved performance (1-hour cache)
- 🔒 Rate limiting (100 requests per 15 minutes)
- 🌍 Metric units support
- 🔑 Environment variable configuration

## Tech Stack

- **Node.js** with Express 5
- **Redis** for in-memory caching
- **Axios** for HTTP requests
- **Visual Crossing Weather API** as data source
- **express-rate-limit** for request throttling

## Project Structure

```
weather-api/
├── config/
│   ├── config.js          # Environment variables
│   └── redisClient.js     # Redis connection setup
├── controllers/
│   └── weather.js         # Request handler
├── model/
│   └── weather.js         # Business logic & caching
├── routes/
│   └── weather.js         # API routes
└── main.js                # Application entry point
```

## Prerequisites

- Node.js (v18 or higher recommended)
- Redis server running locally or remotely
- Visual Crossing API key ([Get it here](https://www.visualcrossing.com/weather-api))

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd weather-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
API_KEY=your_visual_crossing_api_key
PORT=3000
```

4. Make sure Redis is running:
```bash
redis-server
```

## Usage

### Start the development server:
```bash
npm run dev
```

### API Endpoint

**GET** `/:city`

Fetch weather data for a specific city.

**Example:**
```bash
curl http://localhost:3000/London
```

**Response:**
```json
{
  "data": {
    "queryCost": 1,
    "latitude": 51.5064,
    "longitude": -0.12721,
    "resolvedAddress": "London, England, United Kingdom",
    "address": "London",
    "timezone": "Europe/London",
    "days": [...],
    ...
  }
}
```

## How it Works

1. Client requests weather data for a city
2. System checks Redis cache for existing data
3. If cached data exists and is valid (< 1 hour old), return it
4. If not, fetch fresh data from Visual Crossing API
5. Cache the new data in Redis with 1-hour expiration
6. Return data to client

## Rate Limiting

The API is protected with rate limiting:
- **100 requests** per **15 minutes** per IP address

## License

ISC

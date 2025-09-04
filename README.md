# 🎾 Tennis Scoreboard API

A comprehensive REST API with WebSocket support for managing tennis courts and receiving real-time tennis match scoring data. This API automatically processes complex tennis scoring data and provides simplified, optimized data structures for scoreboard displays.

## ✨ Features

- 🔐 **API Key Authentication** - Secure endpoints with configurable API keys
- 🏟️ **Court Management** - Create and manage tennis courts
- 📡 **Real-time WebSocket Support** - Live score updates for scoreboards
- 🎯 **Smart Data Mapping** - Automatically simplifies complex JSON to essential scoreboard data
- ⚡ **Optimized Performance** - Reduces data size by ~85% while preserving all essential information
- 🛡️ **Input Validation** - Comprehensive request validation with detailed error messages
- 📊 **Scoring Data Reception** - Receive and broadcast tennis scoring data in real-time
- 📚 **Interactive Swagger Documentation** - Complete API documentation with testing interface

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd scoring-api
   yarn install
   ```

2. **Start the development server:**
```bash
   yarn start:dev
   ```

3. **Verify the API is running:**
   ```
   🎾 Tennis Scoreboard API is running on: http://localhost:3000
   📡 WebSocket server is available at: ws://localhost:3000
   📚 Swagger API Documentation: http://localhost:3000/api
   📋 Complete Documentation: See README.md
   ```

## 🔧 How to Use

### Step 1: Get Available Courts

First, retrieve the list of available courts for user selection:

```javascript
const response = await fetch('http://localhost:3000/courts', {
  headers: {
    'X-API-Key': 'sk_test_1234567890abcdef'
  }
});

const courts = await response.json();
console.log('Available courts:', courts);
```

**Response:**
```json
[
  {
    "id": "1",
    "name": "Center Court",
    "description": "Main stadium court",
    "surfaceType": "HARD",
    "isIndoor": false,
    "isActive": true
  },
  {
    "id": "2", 
    "name": "Court 1",
    "description": "Practice court 1",
    "surfaceType": "HARD",
    "isIndoor": false,
    "isActive": true
  }
]
```

### Step 2: Connect WebSocket for Real-time Updates

Set up WebSocket connection to receive live score updates:

```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:3000');

// Join a specific match room for updates
socket.emit('join_match', { matchId: 'your-match-id' });

// Or join a court room to get updates for that court
socket.emit('join_court', { courtId: 'selected-court-id' });

// Listen for real-time score updates
socket.on('score_update', (scoreboardData) => {
  console.log('Score updated:', scoreboardData);
  updateScoreboardDisplay(scoreboardData);
});

// Acknowledgment when joining rooms
socket.on('joined_match', (data) => {
  console.log('Joined match room:', data.matchId);
});

socket.on('joined_court', (data) => {
  console.log('Joined court room:', data.courtId);
});
```

### Step 3: Send Tennis Scoring Data

Send your complex tennis scoring data to the API (this is the main integration point):

```javascript
// Your complex tennis scoring data from the scoring application
const complexTennisData = {
  "data": {
    "weather": {"sys": {"timestamp": "2025-07-11T23:07:17.778Z"}},
    "schedule": {"scheduledTime": "16:00", "scheduledDate": null, "timezoneOffset": 420},
    "_id": "68719925c5bf9840f742a23e",
    "startDate": "2025-07-11T23:08:08.291Z",
    "matchFormat": "SET3-S:6NOAD/TB7@6",
    "matchStatus": "IN_PROGRESS",
    "score": {
      "scoreStringSide1": "6-1 2-6 4-1 (0-0)",
      "scoreStringSide2": "1-6 6-2 1-4 (0-0)",
      "side1PointScore": "0",
      "side2PointScore": "0",
      // ... rest of your complex data
    },
    // ... full structure as provided
  }
};

// Send to the API
const response = await fetch('http://localhost:3000/scoring/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'sk_test_1234567890abcdef'
  },
  body: JSON.stringify(complexTennisData)
});

const result = await response.json();
console.log('Update result:', result);
```

**API Response:**
```json
{
  "success": true,
  "matchId": "74794423-3c57-44e8-96a1-ce5d8954887e",
  "updatedAt": "2025-01-16T...",
  "scoreboardData": {
    "matchId": "74794423-3c57-44e8-96a1-ce5d8954887e",
    "status": "IN_PROGRESS",
    "side1Player": "Test Player",
    "side2Player": "Test Player",
    "side1Points": "0",
    "side2Points": "0",
    "sets": [
      {"setNumber": 1, "side1Score": 6, "side2Score": 1, "isCompleted": true},
      {"setNumber": 2, "side1Score": 2, "side2Score": 6, "isCompleted": true},
      {"setNumber": 3, "side1Score": 4, "side2Score": 1, "isCompleted": false}
    ],
    "servingSide": 1,
    "servingPlayer": 1,
    "format": "SET3-S:6NOAD/TB7@6",
    "startTime": "2025-07-11T23:08:08.291Z",
    "lastUpdate": "2025-01-16T..."
  }
}
```

### Step 4: Display Scoreboard Data

Use the simplified `scoreboardData` to update your display:

```javascript
function updateScoreboardDisplay(scoreboardData) {
  // Update player names
  document.getElementById('player1').textContent = scoreboardData.side1Player;
  document.getElementById('player2').textContent = scoreboardData.side2Player;
  
  // Update current point scores
  document.getElementById('score1').textContent = scoreboardData.side1Points;
  document.getElementById('score2').textContent = scoreboardData.side2Points;
  
  // Update set scores
  scoreboardData.sets.forEach((set, index) => {
    document.getElementById(`set${index + 1}_player1`).textContent = set.side1Score;
    document.getElementById(`set${index + 1}_player2`).textContent = set.side2Score;
  });
  
  // Highlight serving player
  const servingPlayer = scoreboardData.servingSide === 1 ? 'player1' : 'player2';
  document.querySelectorAll('.serving').forEach(el => el.classList.remove('serving'));
  document.getElementById(servingPlayer).classList.add('serving');
  
  // Update match status
  document.getElementById('status').textContent = scoreboardData.status;
}
```

## 🔑 Authentication

All API endpoints require authentication using API keys. Include your API key in request headers:

```javascript
// Using X-API-Key header (recommended)
headers: {
  'X-API-Key': 'your-api-key-here'
}

// Or using Authorization header
headers: {
  'Authorization': 'Bearer your-api-key-here'
}
```

### Default API Keys

- **Testing:** `sk_test_1234567890abcdef`
- **Production:** `sk_prod_abcdef1234567890`

> **Note:** Change these default keys in production by updating `src/auth/api-key.guard.ts`

## 📊 Data Transformation & Mapping

The API automatically transforms your complex tennis scoring data:

**Input:** Complex JSON (~15,000+ characters) with detailed match tracking
**Output:** Simplified scoreboard data (~2,000 characters) with essential information only

**Reduction:** ~85% smaller while preserving all scoreboard-relevant data

### From Complex Structure:
- Extracts player names from nested participant objects
- Maps detailed scoring to simple point/game/set scores
- Converts match status codes to standard enum values
- Extracts server information
- Simplifies set scores and tiebreak information

### To Simplified Structure:
- Clean player names and IDs
- Standard score format (0, 15, 30, 40, AD)
- Set scores with completion status
- Current server information
- Match status (NOT_STARTED, IN_PROGRESS, COMPLETED, SUSPENDED)

## 🛠️ Available Scripts

```bash
# Development
yarn start:dev          # Start with hot reload
yarn start:debug        # Start with debugging enabled

# Production
yarn build              # Build the application
yarn start:prod         # Start production server

# Testing
yarn test               # Run unit tests
yarn test:watch         # Run tests in watch mode
yarn test:e2e           # Run end-to-end tests

# Code Quality
yarn lint               # Run ESLint
yarn format             # Format code with Prettier
```

## 📡 WebSocket Events

### Client → Server Events

- `join_match` - Join a specific match room
  ```javascript
  socket.emit('join_match', { matchId: 'match-id' });
  ```

- `join_court` - Join a court room for all matches on that court
  ```javascript
  socket.emit('join_court', { courtId: 'court-id' });
  ```

- `leave_match` - Leave a match room
  ```javascript
  socket.emit('leave_match', { matchId: 'match-id' });
  ```

### Server → Client Events

- `score_update` - Real-time score updates with simplified scoreboard data
- `joined_match` - Confirmation when joining a match room
- `joined_court` - Confirmation when joining a court room
- `error` - Error messages

## 🏗️ Project Structure

```
src/
├── auth/                 # Authentication (API key guard)
├── courts/              # Court management endpoints
├── scoring/             # Scoring data reception & WebSocket gateway
├── dto/                 # Data Transfer Objects & validation
├── utils/               # Utilities (score mapping)
├── app.module.ts        # Main application module
└── main.ts             # Application entry point
```

## 📋 Complete API Reference

### Courts Management

#### GET /courts
Get list of all active courts.

**Response:**
```json
[
  {
    "id": "1",
    "name": "Center Court",
    "description": "Main stadium court",
    "surfaceType": "HARD",
    "isIndoor": false,
    "isActive": true,
    "createdAt": "2025-01-16T...",
    "updatedAt": "2025-01-16T..."
  }
]
```

#### POST /courts
Create a new court.

**Request Body:**
```json
{
  "name": "Court 3",
  "description": "Practice court",
  "surfaceType": "CLAY",
  "isIndoor": true,
  "isActive": true
}
```

#### GET /courts/:id
Get a specific court by ID.

#### PUT /courts/:id
Update a court.

#### DELETE /courts/:id
Deactivate a court (soft delete).


### Scoring Endpoints (Main Integration Point)

#### POST /scoring/update
**This is the main endpoint for your tennis scoring application to send data.**

Accepts the complex JSON structure from your tennis scoring application and automatically maps it to simplified scoreboard data.

**Request Body:**
Send the full JSON structure as provided in your example. The API will automatically extract the essential information.

**Response:**
```json
{
  "success": true,
  "matchId": "74794423-3c57-44e8-96a1-ce5d8954887e",
  "updatedAt": "2025-01-16T...",
  "scoreboardData": {
    "matchId": "74794423-3c57-44e8-96a1-ce5d8954887e",
    "status": "IN_PROGRESS",
    "side1Player": "Test Player",
    "side2Player": "Test Player",
    "side1Points": "0",
    "side2Points": "0",
    "sets": [
      {
        "setNumber": 1,
        "side1Score": 6,
        "side2Score": 1,
        "isCompleted": true
      }
    ],
    "servingSide": 1,
    "servingPlayer": 1,
    "format": "SET3-S:6NOAD/TB7@6",
    "court": "court_id",
    "startTime": "2025-07-11T23:08:08.291Z",
    "lastUpdate": "2025-01-16T..."
  }
}
```

#### GET /scoring/scoreboard/:matchId
Get simplified scoreboard data for display.

#### POST /scoring/test-mapping
Test endpoint to validate data mapping without updating matches.

## 🤝 Integration Example

Complete integration example:

```javascript
class TennisScoreboardIntegration {
  constructor(apiKey, baseUrl = 'http://localhost:3000') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.socket = io(baseUrl);
  }

  async initialize() {
    // 1. Get available courts
    const courts = await this.getCourts();
    console.log('Available courts:', courts);
    
    // 2. Let user select court (implementation depends on your UI)
    const selectedCourtId = await this.showCourtSelection(courts);
    
    // 3. Connect to court's WebSocket room
    this.socket.emit('join_court', { courtId: selectedCourtId });
    
    // 4. Listen for updates
    this.socket.on('score_update', (match) => {
      this.updateScoreboard(match.scoreboardData);
    });
    
    return selectedCourtId;
  }

  async getCourts() {
    const response = await fetch(`${this.baseUrl}/courts`, {
      headers: { 'X-API-Key': this.apiKey }
    });
    return response.json();
  }

  async sendScoringData(complexTennisData) {
    const response = await fetch(`${this.baseUrl}/scoring/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify(complexTennisData)
    });
    return response.json();
  }

  updateScoreboard(scoreboardData) {
    // Your scoreboard update logic here
    console.log('Updating scoreboard:', scoreboardData);
  }
}

// Usage
const integration = new TennisScoreboardIntegration('sk_test_1234567890abcdef');
await integration.initialize();
```

## ⚠️ Error Handling

All endpoints return structured error responses:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-01-16T..."
}
```

**Common HTTP Status Codes:**
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid API key)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

## 🐛 Troubleshooting

**Common Issues:**

1. **401 Unauthorized**: Check your API key is correct and included in headers
2. **404 Not Found**: Verify the endpoint URL and method
3. **WebSocket not connecting**: Ensure the server is running and ports are accessible
4. **Data not updating**: Check that you're sending data to `/scoring/update` endpoint

**Debug Mode:**
```bash
yarn start:debug
```

## 📄 License

This project is licensed under the UNLICENSED license.

---

## 📚 Interactive API Documentation

This API includes **Swagger/OpenAPI documentation** for interactive testing and exploration:

### 🌐 Access Swagger UI
Visit **http://localhost:3000/api** when the server is running to access the interactive documentation.

### 🔑 Authentication in Swagger
1. Click the **"Authorize"** button in Swagger UI
2. Enter your API key in either format:
   - **API Key**: `sk_test_1234567890abcdef` (in X-API-Key field)
   - **Bearer Token**: `sk_test_1234567890abcdef` (in Authorization field)
3. Click **"Authorize"** to authenticate all requests

### ✨ Swagger Features
- **Interactive Testing** - Test all endpoints directly from the browser
- **Request/Response Examples** - See real examples for all endpoints
- **Schema Documentation** - Complete data models and validation rules
- **Try It Out** - Execute API calls with your data
- **Download OpenAPI Spec** - Export API specification for tools

### 🎯 Key Endpoints in Swagger
- **Courts Management** - Create, read, update, delete tennis courts
- **Scoring Integration** - Main `/scoring/update` endpoint with examples
- **Test Endpoints** - Validate your data mapping

---

## 🚀 Deployment

### Quick Deployment

1. **Generate secure API keys:**
   ```bash
   yarn generate:keys
   ```

2. **Set environment variables:**
   ```bash
   export API_KEYS="sk_dev_xxx,sk_prod_xxx"
   export CORS_ORIGIN="https://your-domain.com"
   ```

3. **Deploy with Docker:**
   ```bash
   yarn deploy
   ```

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
NODE_ENV=production
PORT=3000
API_KEYS=sk_dev_your_key,sk_prod_your_key
CORS_ORIGIN=https://your-domain.com
CORS_CREDENTIALS=true
```

### Cloud Deployment Options

- **Railway:** `railway up` (easiest)
- **Heroku:** `git push heroku main`
- **DigitalOcean:** App Platform
- **AWS:** ECS/Fargate
- **Docker:** `docker-compose up -d`

### Security Features

- 🔐 **Environment-based API keys** (no hardcoded secrets)
- 🛡️ **CORS configuration** for domain security
- 🚫 **Rate limiting** with nginx
- 📊 **Health checks** and monitoring
- 🔒 **HTTPS/SSL** support with Let's Encrypt

For complete deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

**Need help?** 
- 📚 **Interactive API:** http://localhost:3000/api
- 🚀 **Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- 📖 **Integration Guide:** This README
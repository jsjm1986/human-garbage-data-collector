# Human Garbage Data Model Training Set Collection System

A specialized data collection system designed to gather human misconceptions, biases, outdated information, and useless knowledge. Through conversations with users, the system collects and categorizes various "garbage information" to provide raw data for training the "Human Garbage Data Model".

## Features

- Retro terminal-style interface
- Real-time data collection and analysis
- Automated data classification and storage
- Data value assessment system
- Real-time statistics and visualization

## Tech Stack

- Frontend: HTML5 + CSS3 + JavaScript
- Backend: Node.js + Express
- API Integration: DeepSeek AI
- Data Storage: JSONL file system

## Installation

1. Clone the repository

```bash
git clone https://github.com/jsjm1986/-human-garbage-data-collector.git
cd -human-garbage-data-collector
```

2. Install dependencies
```bash
npm install
```

3. Configure API key
Set your DeepSeek API key in `app.js`:
```javascript
const DEEPSEEK_API_KEY = 'your-api-key';
```

4. Start the server
```bash
npm start
```

5. Access the system
Open your browser and visit `http://localhost:3000`

## Functionality

### Data Collection
- Real-time conversation collection
- Automatic classification and labeling
- Quality scoring system
- Pollution level calculation

### Data Storage
- Training data: `training_data/training_data_[date].jsonl`
- Garbage data: `garbage_data/garbage_data_[date].jsonl`

### Data Format

#### Training Data Format
```json
{
    "id": "timestamp_id",
    "timestamp": "time",
    "conversation": {
        "instruction": "user_input",
        "response": "ai_response"
    },
    "metadata": {
        "category": "category",
        "confidence": "confidence_score",
        "quality_score": "quality_score",
        "tokens": "token_count"
    }
}
```

#### Garbage Data Format
```json
{
    "id": "garbage_timestamp_id",
    "timestamp": "time",
    "source_id": "original_conversation_id",
    "garbage_type": "garbage_type",
    "content": {
        "original_thought": "original_thought",
        "ai_interpretation": "ai_interpretation",
        "extracted_misconceptions": {
            "primary_misconception": "primary_misconception",
            "related_misconceptions": ["related_misconceptions"],
            "potential_sources": ["potential_sources"]
        },
        "potential_value": "research_value"
    },
    "metadata": {
        "confidence": "confidence_score",
        "quality_score": "quality_score",
        "garbage_level": "garbage_level",
        "reusability": "reusability_score"
    }
}
```

## API Endpoints

### Data Storage
- POST `/save-training-data`: Save training data
- POST `/save-garbage-info`: Save garbage information

### Data Retrieval
- GET `/garbage-stats`: Get garbage data statistics
- GET `/garbage-data/:date`: Get garbage data for specific date
- GET `/export-garbage-data/:date`: Export garbage data for specific date

## Usage Guide

1. **Start Conversation**: Enter any content in the input box to start dialogue with AI
2. **Data Collection**: System automatically collects and categorizes conversation content
3. **View Statistics**: Real-time display of data collection statistics and analysis results
4. **Export Data**: Use export function to get JSON format data files

## Important Notes

- All collected data is used for training purposes only
- System automatically filters sensitive information
- Regular backup of data files is recommended
- Do not manually modify data file formats

## Development Roadmap

- [ ] Add data encryption functionality
- [ ] Implement data compression storage
- [ ] Add more data analysis dimensions
- [ ] Optimize AI response speed
- [ ] Add data visualization charts

## Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Submit a Pull Request

## License

MIT License

## Contact

- Project Maintainer: jsjm1986
- Email: [Email Address]
- Project URL: [Project URL]
- Repository: https://github.com/jsjm1986/-human-garbage-data-collector

## Acknowledgments

This project is designed to explore the boundaries of AI training data collection and processing. It serves as an experimental platform for understanding human cognitive biases and information processing patterns. 

## System Requirements

### Hardware Requirements
- CPU: Dual-core processor or higher
- RAM: Minimum 4GB (8GB recommended)
- Storage: 1GB free space for base installation
- Network: Stable internet connection required

### Software Requirements
- Node.js: v14.0.0 or higher
- npm: v6.0.0 or higher
- Operating System:
  - Windows 10/11
  - macOS 10.15 or higher
  - Ubuntu 20.04 or higher
- Browser:
  - Chrome 90+ (recommended)
  - Firefox 88+
  - Edge 90+

### Development Environment
- Git
- Code editor (VS Code recommended)
- Terminal access

## Technical Details

### Architecture Overview
```
project/
├── frontend/
│   ├── index.html      # Main UI interface
│   ├── styles.css      # Retro terminal styling
│   └── app.js         # Frontend logic and API calls
├── backend/
│   ├── server.js      # Express server setup
│   └── api/           # API endpoint implementations
├── data/
│   ├── training_data/ # Training data storage
│   └── garbage_data/  # Garbage data storage
└── utils/             # Utility functions
```

### Key Components
1. **Frontend Implementation**
   - Custom terminal emulator using CSS Grid and Flexbox
   - Real-time data updates using WebSocket
   - Responsive design with mobile support
   - Custom animations for retro terminal effects

2. **Backend Services**
   - RESTful API implementation
   - File system operations for data storage
   - Data validation and sanitization
   - Rate limiting and security measures

3. **Data Processing Pipeline**
   ```
   User Input -> Validation -> AI Processing -> 
   Data Extraction -> Classification -> Storage
   ```

4. **AI Integration**
   - DeepSeek API configuration
   - Response processing and filtering
   - Error handling and retry logic
   - Rate limit management

5. **Data Management**
   - JSONL format for efficient storage
   - Automatic file rotation based on date
   - Data backup and recovery systems
   - Compression for large datasets

### Performance Optimizations
- Client-side caching
- Request batching
- Lazy loading of historical data
- Debounced API calls
- Memory usage optimization

## Troubleshooting Guide

### Common Issues and Solutions

1. **Server Won't Start**
   ```bash
   Error: EADDRINUSE: address already in use :::3000
   ```
   **Solution:**
   ```bash
   # Find and kill the process using port 3000
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **API Key Issues**
   ```javascript
   Error: Invalid API key provided
   ```
   **Solution:**
   - Verify API key in `app.js`
   - Check environment variables
   - Ensure key has required permissions

3. **Data Storage Errors**
   ```javascript
   Error: EACCES: permission denied
   ```
   **Solution:**
   ```bash
   # Fix directory permissions
   chmod 755 training_data
   chmod 755 garbage_data
   ```

4. **Memory Leaks**
   **Symptoms:**
   - Increasing memory usage
   - Slow response times
   
   **Solution:**
   - Enable garbage collection logging
   - Monitor memory usage
   - Implement cleanup routines

5. **WebSocket Connection Issues**
   **Symptoms:**
   - Disconnections
   - Failed real-time updates
   
   **Solution:**
   - Check network stability
   - Implement reconnection logic
   - Verify proxy settings

### Debug Mode
Enable debug mode for detailed logging:
```javascript
// In app.js
const DEBUG_MODE = true;

// In server.js
if (process.env.DEBUG) {
    app.use(morgan('dev'));
    console.debug = console.log;
}
```

### Logging
```bash
# Enable detailed logging
export DEBUG=app:*
npm start
```

### Performance Monitoring
```javascript
// Monitor memory usage
setInterval(() => {
    const used = process.memoryUsage();
    console.log(`Memory usage: ${Math.round(used.heapUsed / 1024 / 1024)}MB`);
}, 30000);
```

## Docker Deployment

### Prerequisites
- Docker Engine 20.10.0+
- Docker Compose 2.0.0+
- 2GB free memory for container
- 1GB free disk space

### Quick Start with Docker
1. Build and start the container:
```bash
docker-compose up -d
```

2. View logs:
```bash
docker-compose logs -f
```

3. Stop the container:
```bash
docker-compose down
```

### Docker Configuration

#### Environment Variables
```env
NODE_ENV=production
DEBUG=app:*
PORT=3000
```

#### Volume Mounts
- `./training_data:/app/training_data`: Training data persistence
- `./garbage_data:/app/garbage_data`: Garbage data persistence

#### Health Checks
The container includes automatic health checks:
- Interval: 30s
- Timeout: 10s
- Retries: 3

### Docker Commands Reference

1. **Build the image:**
```bash
docker build -t garbage-collector .
```

2. **Run the container:**
```bash
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/training_data:/app/training_data \
  -v $(pwd)/garbage_data:/app/garbage_data \
  --name garbage-collector \
  garbage-collector
```

3. **View container logs:**
```bash
docker logs -f garbage-collector
```

4. **Enter container shell:**
```bash
docker exec -it garbage-collector sh
```

5. **Check container status:**
```bash
docker ps
docker stats garbage-collector
```

### Container Management

#### Backup Data
```bash
# Create backup of data volumes
docker run --rm \
  -v garbage-collector_data:/data \
  -v $(pwd)/backup:/backup \
  alpine tar czf /backup/data-backup.tar.gz /data
```

#### Restore Data
```bash
# Restore from backup
docker run --rm \
  -v garbage-collector_data:/data \
  -v $(pwd)/backup:/backup \
  alpine tar xzf /backup/data-backup.tar.gz
```

#### Container Maintenance
```bash
# Update container
docker-compose pull
docker-compose up -d

# Remove unused resources
docker system prune -f
```

### Troubleshooting Docker Issues

1. **Container Won't Start**
```bash
# Check logs
docker logs garbage-collector

# Verify port availability
netstat -tulpn | grep 3000
```

2. **Volume Permission Issues**
```bash
# Fix permissions
sudo chown -R 1000:1000 ./training_data ./garbage_data
```

3. **Memory Issues**
```bash
# Check container resources
docker stats garbage-collector

# Increase container memory limit
docker update --memory 2G garbage-collector
```
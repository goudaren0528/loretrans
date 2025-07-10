#!/bin/bash

# Continuous API Monitoring Script
# Purpose: 持续监控API运行状态和性能
# Author: Generated for translation-low-source project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_URL="${API_BASE_URL:-http://localhost:3000}"
INTERVAL=60  # seconds
MAX_FAILURES=3
LOG_FILE="$SCRIPT_DIR/logs/api-monitor.log"
METRICS_FILE="$SCRIPT_DIR/logs/api-metrics.json"
ALERT_WEBHOOK=""
RUNNING=true

# Create logs directory
mkdir -p "$SCRIPT_DIR/logs"

# Logging functions
log() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

success() {
    local message="✓ $1"
    echo -e "${GREEN}$message${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message" >> "$LOG_FILE"
}

error() {
    local message="✗ $1"
    echo -e "${RED}$message${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $message" >> "$LOG_FILE"
}

warning() {
    local message="⚠ $1"
    echo -e "${YELLOW}$message${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $message" >> "$LOG_FILE"
}

# Signal handlers
cleanup() {
    log "Shutting down API monitor..."
    RUNNING=false
    exit 0
}

trap cleanup SIGINT SIGTERM

# Health check function
check_health() {
    local start_time=$(date +%s%3N)
    local response
    local http_code
    local response_time
    
    response=$(curl -s -w "%{http_code}" --connect-timeout 10 --max-time 30 "$BASE_URL/health" 2>/dev/null || echo "000")
    http_code="${response: -3}"
    local end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    
    if [ "$http_code" = "200" ]; then
        success "Health check passed (${response_time}ms)"
        return 0
    else
        error "Health check failed - HTTP $http_code (${response_time}ms)"
        return 1
    fi
}

# Translation API test
test_translation() {
    local start_time=$(date +%s%3N)
    local data='{"text": "Hello world", "source_lang": "en", "target_lang": "zh"}'
    local response
    local http_code
    local response_time
    
    response=$(curl -s -w "%{http_code}" --connect-timeout 10 --max-time 30 \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$BASE_URL/api/translate" 2>/dev/null || echo "000")
    
    http_code="${response: -3}"
    local end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    
    if [ "$http_code" = "200" ]; then
        success "Translation API test passed (${response_time}ms)"
        return 0
    else
        error "Translation API test failed - HTTP $http_code (${response_time}ms)"
        return 1
    fi
}

# Language detection test
test_detection() {
    local start_time=$(date +%s%3N)
    local data='{"text": "Hello world"}'
    local response
    local http_code
    local response_time
    
    response=$(curl -s -w "%{http_code}" --connect-timeout 10 --max-time 30 \
        -H "Content-Type: application/json" \
        -d "$data" \
        "$BASE_URL/api/detect" 2>/dev/null || echo "000")
    
    http_code="${response: -3}"
    local end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    
    if [ "$http_code" = "200" ]; then
        success "Detection API test passed (${response_time}ms)"
        return 0
    else
        error "Detection API test failed - HTTP $http_code (${response_time}ms)"
        return 1
    fi
}

# Languages list test
test_languages() {
    local start_time=$(date +%s%3N)
    local response
    local http_code
    local response_time
    
    response=$(curl -s -w "%{http_code}" --connect-timeout 10 --max-time 30 \
        "$BASE_URL/api/languages" 2>/dev/null || echo "000")
    
    http_code="${response: -3}"
    local end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    
    if [ "$http_code" = "200" ]; then
        success "Languages API test passed (${response_time}ms)"
        return 0
    else
        error "Languages API test failed - HTTP $http_code (${response_time}ms)"
        return 1
    fi
}

# Record metrics
record_metrics() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local health_status=$1
    local translation_status=$2
    local detection_status=$3
    local languages_status=$4
    
    # Create or update metrics file
    local metrics="{
        \"timestamp\": \"$timestamp\",
        \"base_url\": \"$BASE_URL\",
        \"health_check\": $health_status,
        \"translation_api\": $translation_status,
        \"detection_api\": $detection_status,
        \"languages_api\": $languages_status,
        \"overall_status\": $(( health_status && translation_status && detection_status && languages_status ))
    }"
    
    # Append to metrics file
    echo "$metrics" >> "$METRICS_FILE"
    
    # Keep only last 1000 entries
    tail -n 1000 "$METRICS_FILE" > "$METRICS_FILE.tmp" && mv "$METRICS_FILE.tmp" "$METRICS_FILE"
}

# Send alert
send_alert() {
    local message="$1"
    local severity="$2"
    
    if [ -n "$ALERT_WEBHOOK" ]; then
        local payload="{
            \"text\": \"🚨 API Monitor Alert\",
            \"attachments\": [{
                \"color\": \"danger\",
                \"fields\": [{
                    \"title\": \"Message\",
                    \"value\": \"$message\",
                    \"short\": false
                }, {
                    \"title\": \"Severity\",
                    \"value\": \"$severity\",
                    \"short\": true
                }, {
                    \"title\": \"Base URL\",
                    \"value\": \"$BASE_URL\",
                    \"short\": true
                }, {
                    \"title\": \"Timestamp\",
                    \"value\": \"$(date)\",
                    \"short\": true
                }]
            }]
        }"
        
        curl -X POST -H 'Content-type: application/json' \
            --data "$payload" "$ALERT_WEBHOOK" &>/dev/null || true
    fi
}

# Generate status report
generate_status_report() {
    local report_file="$SCRIPT_DIR/logs/status-report-$(date '+%Y%m%d_%H%M%S').html"
    
    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Monitoring Status Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .status-card { padding: 20px; border-radius: 8px; text-align: center; }
        .status-card.healthy { background: #d4edda; border: 1px solid #c3e6cb; }
        .status-card.unhealthy { background: #f8d7da; border: 1px solid #f5c6cb; }
        .metrics { margin-top: 20px; }
        .log-section { margin-top: 30px; }
        .log-entry { margin: 5px 0; padding: 10px; background: #f8f9fa; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
        .timestamp { color: #666; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>API Monitoring Status Report</h1>
            <p class="timestamp">Generated on: <span id="timestamp"></span></p>
            <p>Base URL: <strong id="base-url"></strong></p>
        </div>
        
        <div class="status-grid">
            <div class="status-card" id="health-status">
                <h3>Health Check</h3>
                <p id="health-result">Checking...</p>
            </div>
            <div class="status-card" id="translation-status">
                <h3>Translation API</h3>
                <p id="translation-result">Checking...</p>
            </div>
            <div class="status-card" id="detection-status">
                <h3>Detection API</h3>
                <p id="detection-result">Checking...</p>
            </div>
            <div class="status-card" id="languages-status">
                <h3>Languages API</h3>
                <p id="languages-result">Checking...</p>
            </div>
        </div>
        
        <div class="log-section">
            <h2>Recent Activity</h2>
            <div id="log-entries"></div>
        </div>
    </div>
    
    <script>
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
        document.getElementById('base-url').textContent = 'BASE_URL_PLACEHOLDER';
        
        // Auto-refresh every 30 seconds
        setTimeout(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>
EOF

    log "Status report generated: $report_file"
}

# Main monitoring loop
monitor_apis() {
    local consecutive_failures=0
    local cycle_count=0
    
    log "Starting API monitoring for: $BASE_URL"
    log "Check interval: ${INTERVAL}s"
    log "Max failures before alert: $MAX_FAILURES"
    
    while [ "$RUNNING" = true ]; do
        cycle_count=$((cycle_count + 1))
        log "Monitoring cycle #$cycle_count"
        
        # Run all tests
        local health_ok=0
        local translation_ok=0
        local detection_ok=0
        local languages_ok=0
        
        if check_health; then health_ok=1; fi
        if test_translation; then translation_ok=1; fi
        if test_detection; then detection_ok=1; fi
        if test_languages; then languages_ok=1; fi
        
        # Record metrics
        record_metrics $health_ok $translation_ok $detection_ok $languages_ok
        
        # Check overall status
        local overall_ok=$((health_ok && translation_ok && detection_ok && languages_ok))
        
        if [ $overall_ok -eq 1 ]; then
            consecutive_failures=0
            success "All APIs are healthy"
        else
            consecutive_failures=$((consecutive_failures + 1))
            error "Some APIs are failing (consecutive failures: $consecutive_failures)"
            
            if [ $consecutive_failures -ge $MAX_FAILURES ]; then
                send_alert "API monitoring detected $consecutive_failures consecutive failures" "HIGH"
                warning "Alert sent due to consecutive failures"
            fi
        fi
        
        # Generate status report every 10 cycles
        if [ $((cycle_count % 10)) -eq 0 ]; then
            generate_status_report
        fi
        
        # Wait for next cycle
        if [ "$RUNNING" = true ]; then
            log "Waiting ${INTERVAL}s for next check..."
            sleep $INTERVAL
        fi
    done
}

# Usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Options:
    -u, --url URL           Base URL to monitor [default: http://localhost:3000]
    -i, --interval SEC      Check interval in seconds [default: 60]
    -f, --max-failures N    Max consecutive failures before alert [default: 3]
    -w, --webhook URL       Slack webhook URL for alerts
    -l, --log-file FILE     Log file path [default: ./logs/api-monitor.log]
    -h, --help              Show this help message

Examples:
    $0                                          # Monitor localhost with default settings
    $0 -u https://api.example.com -i 30        # Monitor production API every 30 seconds
    $0 -w https://hooks.slack.com/...          # Enable Slack alerts

The monitor will run continuously until stopped with Ctrl+C.
Logs and metrics are saved to the logs/ directory.
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            BASE_URL="$2"
            shift 2
            ;;
        -i|--interval)
            INTERVAL="$2"
            shift 2
            ;;
        -f|--max-failures)
            MAX_FAILURES="$2"
            shift 2
            ;;
        -w|--webhook)
            ALERT_WEBHOOK="$2"
            shift 2
            ;;
        -l|--log-file)
            LOG_FILE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Start monitoring
monitor_apis
EOF

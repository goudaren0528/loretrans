#!/bin/bash

# Enhanced API Test Runner
# Purpose: 运行时API测试的增强版本
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

# Default configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/api-test-config.json"
TEST_SCRIPT="$SCRIPT_DIR/test-apis-with-curl.sh"
ENVIRONMENT="local"
PARALLEL_TESTS=false
GENERATE_REPORT=true
SLACK_WEBHOOK=""

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# Check dependencies
check_dependencies() {
    local deps=("curl" "jq")
    local missing=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        error "Missing dependencies: ${missing[*]}"
        info "Please install missing dependencies:"
        for dep in "${missing[@]}"; do
            case $dep in
                jq)
                    echo "  sudo apt-get install jq  # Ubuntu/Debian"
                    echo "  brew install jq          # macOS"
                    ;;
                curl)
                    echo "  sudo apt-get install curl  # Ubuntu/Debian"
                    echo "  brew install curl          # macOS"
                    ;;
            esac
        done
        exit 1
    fi
}

# Load configuration
load_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        warning "Configuration file not found: $CONFIG_FILE"
        warning "Using default configuration"
        return 1
    fi
    
    # Validate JSON
    if ! jq empty "$CONFIG_FILE" 2>/dev/null; then
        error "Invalid JSON in configuration file: $CONFIG_FILE"
        exit 1
    fi
    
    success "Configuration loaded from: $CONFIG_FILE"
    return 0
}

# Get environment configuration
get_env_config() {
    local env="$1"
    
    if [ -f "$CONFIG_FILE" ]; then
        local base_url=$(jq -r ".environments.${env}.base_url // empty" "$CONFIG_FILE")
        local timeout=$(jq -r ".environments.${env}.timeout // 30" "$CONFIG_FILE")
        
        if [ -n "$base_url" ]; then
            echo "BASE_URL=$base_url"
            echo "TIMEOUT=$timeout"
            return 0
        fi
    fi
    
    # Default configuration
    case $env in
        local)
            echo "BASE_URL=http://localhost:3000"
            echo "TIMEOUT=30"
            ;;
        staging)
            echo "BASE_URL=https://staging.your-domain.com"
            echo "TIMEOUT=45"
            ;;
        production)
            echo "BASE_URL=https://your-domain.com"
            echo "TIMEOUT=60"
            ;;
        *)
            error "Unknown environment: $env"
            exit 1
            ;;
    esac
}

# Pre-flight checks
preflight_checks() {
    local base_url="$1"
    
    log "Running pre-flight checks for: $base_url"
    
    # Check if server is reachable
    if curl -s --connect-timeout 10 "$base_url/health" > /dev/null 2>&1; then
        success "Server is reachable"
    else
        warning "Server health check failed, but continuing with tests"
    fi
    
    # Check if required endpoints exist
    local endpoints=("/api/translate" "/api/detect" "/api/languages")
    for endpoint in "${endpoints[@]}"; do
        local status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$base_url$endpoint" || echo "000")
        if [ "$status" != "000" ]; then
            success "Endpoint $endpoint is accessible (HTTP $status)"
        else
            warning "Endpoint $endpoint is not accessible"
        fi
    done
}

# Run tests with environment configuration
run_tests() {
    local env="$1"
    local test_type="$2"
    
    log "Running tests for environment: $env"
    
    # Get environment configuration
    local env_config
    env_config=$(get_env_config "$env")
    eval "$env_config"
    
    info "Base URL: $BASE_URL"
    info "Timeout: $TIMEOUT seconds"
    
    # Run pre-flight checks
    preflight_checks "$BASE_URL"
    
    # Prepare test command
    local test_cmd="$TEST_SCRIPT"
    test_cmd="$test_cmd --url '$BASE_URL'"
    test_cmd="$test_cmd --timeout $TIMEOUT"
    test_cmd="$test_cmd --output './test-results-$env'"
    
    if [ "$VERBOSE" = true ]; then
        test_cmd="$test_cmd --verbose"
    fi
    
    if [ -n "$test_type" ]; then
        test_cmd="$test_cmd $test_type"
    fi
    
    log "Executing: $test_cmd"
    
    # Run the tests
    if eval "$test_cmd"; then
        success "Tests completed successfully for environment: $env"
        return 0
    else
        error "Tests failed for environment: $env"
        return 1
    fi
}

# Generate comprehensive report
generate_report() {
    local env="$1"
    local report_file="./api-test-report-$env-$(date '+%Y%m%d_%H%M%S').html"
    
    log "Generating comprehensive test report: $report_file"
    
    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .test-results { margin-top: 20px; }
        .test-item { margin: 10px 0; padding: 15px; border-left: 4px solid #007bff; background: #f8f9fa; }
        .test-item.success { border-left-color: #28a745; }
        .test-item.error { border-left-color: #dc3545; }
        pre { background: #f1f1f1; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>API Test Report</h1>
            <p class="timestamp">Generated on: <span id="timestamp"></span></p>
        </div>
        
        <div class="summary">
            <div class="card">
                <h3>Environment</h3>
                <p id="environment"></p>
            </div>
            <div class="card">
                <h3>Total Tests</h3>
                <p id="total-tests">0</p>
            </div>
            <div class="card">
                <h3 class="success">Passed</h3>
                <p id="passed-tests">0</p>
            </div>
            <div class="card">
                <h3 class="error">Failed</h3>
                <p id="failed-tests">0</p>
            </div>
        </div>
        
        <div class="test-results">
            <h2>Test Results</h2>
            <div id="test-list"></div>
        </div>
    </div>
    
    <script>
        document.getElementById('timestamp').textContent = new Date().toLocaleString();
        document.getElementById('environment').textContent = 'ENVIRONMENT_PLACEHOLDER';
    </script>
</body>
</html>
EOF

    success "Report template generated: $report_file"
}

# Send notification (if configured)
send_notification() {
    local env="$1"
    local status="$2"
    local message="$3"
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        local payload="{\"text\":\"API Tests [$env]: $status - $message\"}"
        curl -X POST -H 'Content-type: application/json' --data "$payload" "$SLACK_WEBHOOK" || true
    fi
}

# Usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS] [TEST_TYPE]

Options:
    -e, --env ENV           Environment to test (local|staging|production) [default: local]
    -c, --config FILE       Configuration file path [default: ./api-test-config.json]
    -v, --verbose           Enable verbose output
    -p, --parallel          Run tests in parallel (experimental)
    -r, --no-report         Skip report generation
    -s, --slack-webhook URL Slack webhook URL for notifications
    -h, --help              Show this help message

Test Types:
    all                     Run all tests (default)
    health                  Health check tests only
    translation             Translation API tests only
    auth                    Authentication tests only
    performance             Performance tests only
    errors                  Error handling tests only

Examples:
    $0                                          # Run all tests on local environment
    $0 -e staging translation                   # Run translation tests on staging
    $0 -e production -v                         # Run all tests on production with verbose output
    $0 -c custom-config.json -e local          # Use custom configuration file

Environment Configuration:
    The script uses api-test-config.json for environment settings.
    You can override settings with command line options.
EOF
}

# Parse command line arguments
VERBOSE=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -c|--config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -p|--parallel)
            PARALLEL_TESTS=true
            shift
            ;;
        -r|--no-report)
            GENERATE_REPORT=false
            shift
            ;;
        -s|--slack-webhook)
            SLACK_WEBHOOK="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            TEST_TYPE="$1"
            shift
            ;;
    esac
done

# Main execution
main() {
    log "Starting API test runner"
    
    # Check dependencies
    check_dependencies
    
    # Load configuration
    load_config
    
    # Validate test script exists
    if [ ! -f "$TEST_SCRIPT" ]; then
        error "Test script not found: $TEST_SCRIPT"
        exit 1
    fi
    
    # Make sure test script is executable
    chmod +x "$TEST_SCRIPT"
    
    # Run tests
    local start_time=$(date +%s)
    
    if run_tests "$ENVIRONMENT" "$TEST_TYPE"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        success "All tests completed successfully in ${duration}s"
        
        # Generate report if requested
        if [ "$GENERATE_REPORT" = true ]; then
            generate_report "$ENVIRONMENT"
        fi
        
        # Send success notification
        send_notification "$ENVIRONMENT" "SUCCESS" "All tests passed in ${duration}s"
        
        exit 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        error "Tests failed after ${duration}s"
        
        # Send failure notification
        send_notification "$ENVIRONMENT" "FAILED" "Some tests failed after ${duration}s"
        
        exit 1
    fi
}

# Run main function
main "$@"
EOF

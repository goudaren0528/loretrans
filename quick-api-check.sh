#!/bin/bash

# Quick API Status Check
# Purpose: 快速检查API运行状态
# Author: Generated for translation-low-source project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-http://localhost:3000}"
TIMEOUT=10

# Logging functions
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
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

# Quick test function
quick_test() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    local start_time=$(date +%s%3N)
    local curl_cmd="curl -s -w '%{http_code}' --connect-timeout $TIMEOUT --max-time $TIMEOUT"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    curl_cmd="$curl_cmd -X $method '$BASE_URL$endpoint'"
    
    local response
    response=$(eval $curl_cmd 2>/dev/null || echo "000")
    local http_code="${response: -3}"
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    printf "%-20s " "$name:"
    
    if [ "$http_code" = "$expected_status" ]; then
        success "HTTP $http_code (${response_time}ms)"
        return 0
    elif [ "$http_code" = "000" ]; then
        error "Connection failed"
        return 1
    else
        warning "HTTP $http_code (expected $expected_status, ${response_time}ms)"
        return 1
    fi
}

# Main check function
main() {
    log "Quick API Status Check for: $BASE_URL"
    echo "=================================================="
    
    local total_tests=0
    local passed_tests=0
    
    # Health check
    total_tests=$((total_tests + 1))
    if quick_test "Health" "GET" "/health" "" "200"; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Basic translation
    total_tests=$((total_tests + 1))
    if quick_test "Translation" "POST" "/api/translate" '{"text":"Hello","source_lang":"en","target_lang":"zh"}' "200"; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Language detection
    total_tests=$((total_tests + 1))
    if quick_test "Detection" "POST" "/api/detect" '{"text":"Hello world"}' "200"; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Supported languages
    total_tests=$((total_tests + 1))
    if quick_test "Languages" "GET" "/api/languages" "" "200"; then
        passed_tests=$((passed_tests + 1))
    fi
    
    # Error handling test
    total_tests=$((total_tests + 1))
    if quick_test "Error Handling" "POST" "/api/translate" '{"invalid":"json"}' "400"; then
        passed_tests=$((passed_tests + 1))
    fi
    
    echo "=================================================="
    
    # Summary
    local success_rate=$((passed_tests * 100 / total_tests))
    
    if [ $passed_tests -eq $total_tests ]; then
        success "All tests passed ($passed_tests/$total_tests) - Success rate: $success_rate%"
        exit 0
    elif [ $passed_tests -gt 0 ]; then
        warning "Some tests failed ($passed_tests/$total_tests) - Success rate: $success_rate%"
        exit 1
    else
        error "All tests failed ($passed_tests/$total_tests) - Success rate: $success_rate%"
        exit 2
    fi
}

# Usage function
usage() {
    cat << EOF
Usage: $0 [BASE_URL]

Arguments:
    BASE_URL    Base URL to test [default: http://localhost:3000]

Examples:
    $0                                  # Test localhost
    $0 http://localhost:8080            # Test custom port
    $0 https://api.example.com          # Test production API

This script performs a quick health check of the translation API endpoints.
EOF
}

# Check for help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
fi

# Run main function
main
EOF

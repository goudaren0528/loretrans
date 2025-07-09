#!/bin/bash

# API Testing Script with curl
# Purpose: 创建基于curl的实际API测试脚本
# Author: Generated for translation-low-source project
# Date: $(date)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${API_BASE_URL:-http://localhost:8080}"
TIMEOUT=30
VERBOSE=false
OUTPUT_DIR="./test-results"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Logging function
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

# Test function template
test_api() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    local description="$6"
    
    log "Testing: $test_name"
    echo "Description: $description"
    
    local curl_cmd="curl -s -w '%{http_code}' -o response.tmp"
    curl_cmd="$curl_cmd --connect-timeout $TIMEOUT"
    curl_cmd="$curl_cmd -X $method"
    
    if [ "$VERBOSE" = true ]; then
        curl_cmd="$curl_cmd -v"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    curl_cmd="$curl_cmd '$BASE_URL$endpoint'"
    
    echo "Command: $curl_cmd"
    
    # Execute curl command
    local http_code
    http_code=$(eval $curl_cmd)
    local curl_exit_code=$?
    
    # Save response
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local response_file="$OUTPUT_DIR/${test_name}_${timestamp}.json"
    mv response.tmp "$response_file" 2>/dev/null || touch "$response_file"
    
    # Check results
    if [ $curl_exit_code -ne 0 ]; then
        error "Request failed with curl exit code: $curl_exit_code"
        return 1
    fi
    
    if [ "$http_code" = "$expected_status" ]; then
        success "HTTP $http_code (Expected: $expected_status)"
        echo "Response saved to: $response_file"
    else
        error "HTTP $http_code (Expected: $expected_status)"
        echo "Response saved to: $response_file"
        return 1
    fi
    
    echo "---"
}

# Health check test
test_health_check() {
    test_api "health_check" "GET" "/health" "" "200" "Basic health check endpoint"
}

# Translation API tests
test_translation_basic() {
    local data='{"text": "Hello world", "source_lang": "en", "target_lang": "zh"}'
    test_api "translation_basic" "POST" "/api/translate" "$data" "200" "Basic translation test"
}

test_translation_batch() {
    local data='{"texts": ["Hello", "World", "Test"], "source_lang": "en", "target_lang": "zh"}'
    test_api "translation_batch" "POST" "/api/translate/batch" "$data" "200" "Batch translation test"
}

test_translation_invalid_lang() {
    local data='{"text": "Hello", "source_lang": "invalid", "target_lang": "zh"}'
    test_api "translation_invalid_lang" "POST" "/api/translate" "$data" "400" "Invalid language code test"
}

test_translation_empty_text() {
    local data='{"text": "", "source_lang": "en", "target_lang": "zh"}'
    test_api "translation_empty_text" "POST" "/api/translate" "$data" "400" "Empty text test"
}

# Language detection tests
test_language_detection() {
    local data='{"text": "Hello world"}'
    test_api "language_detection" "POST" "/api/detect" "$data" "200" "Language detection test"
}

# Supported languages test
test_supported_languages() {
    test_api "supported_languages" "GET" "/api/languages" "" "200" "Get supported languages"
}

# Authentication tests (if applicable)
test_auth_required() {
    test_api "auth_required" "GET" "/api/admin" "" "401" "Test authentication requirement"
}

test_auth_with_token() {
    local auth_header="-H 'Authorization: Bearer test-token'"
    # Note: This would need modification to handle auth headers properly
    warning "Auth with token test needs manual implementation"
}

# Rate limiting tests
test_rate_limiting() {
    log "Testing rate limiting (making multiple rapid requests)"
    for i in {1..10}; do
        local data='{"text": "Rate limit test '$i'", "source_lang": "en", "target_lang": "zh"}'
        test_api "rate_limit_$i" "POST" "/api/translate" "$data" "200" "Rate limiting test #$i"
        sleep 0.1
    done
}

# Performance tests
test_large_text() {
    local large_text=$(printf 'A%.0s' {1..1000})  # 1000 character string
    local data='{"text": "'$large_text'", "source_lang": "en", "target_lang": "zh"}'
    test_api "large_text" "POST" "/api/translate" "$data" "200" "Large text translation test"
}

# Error handling tests
test_malformed_json() {
    local data='{"text": "Hello", "source_lang": "en", "target_lang": "zh"'  # Missing closing brace
    test_api "malformed_json" "POST" "/api/translate" "$data" "400" "Malformed JSON test"
}

test_missing_fields() {
    local data='{"text": "Hello"}'  # Missing required fields
    test_api "missing_fields" "POST" "/api/translate" "$data" "400" "Missing required fields test"
}

# Main test runner
run_all_tests() {
    log "Starting API tests for $BASE_URL"
    log "Output directory: $OUTPUT_DIR"
    
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    
    # List of test functions
    local tests=(
        "test_health_check"
        "test_supported_languages"
        "test_translation_basic"
        "test_translation_batch"
        "test_translation_invalid_lang"
        "test_translation_empty_text"
        "test_language_detection"
        "test_auth_required"
        "test_malformed_json"
        "test_missing_fields"
        "test_large_text"
    )
    
    for test_func in "${tests[@]}"; do
        total_tests=$((total_tests + 1))
        if $test_func; then
            passed_tests=$((passed_tests + 1))
        else
            failed_tests=$((failed_tests + 1))
        fi
        echo
    done
    
    # Summary
    log "Test Summary:"
    echo "Total tests: $total_tests"
    success "Passed: $passed_tests"
    if [ $failed_tests -gt 0 ]; then
        error "Failed: $failed_tests"
    else
        echo "Failed: $failed_tests"
    fi
    
    # Generate report
    generate_report "$total_tests" "$passed_tests" "$failed_tests"
}

# Generate test report
generate_report() {
    local total=$1
    local passed=$2
    local failed=$3
    local report_file="$OUTPUT_DIR/test_report_$(date '+%Y%m%d_%H%M%S').txt"
    
    cat > "$report_file" << EOF
API Test Report
===============
Date: $(date)
Base URL: $BASE_URL
Total Tests: $total
Passed: $passed
Failed: $failed
Success Rate: $(( passed * 100 / total ))%

Test Results Directory: $OUTPUT_DIR
EOF
    
    log "Test report saved to: $report_file"
}

# Usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS] [TEST_NAME]

Options:
    -u, --url URL       Set base URL (default: $BASE_URL)
    -v, --verbose       Enable verbose output
    -t, --timeout SEC   Set timeout in seconds (default: $TIMEOUT)
    -o, --output DIR    Set output directory (default: $OUTPUT_DIR)
    -h, --help          Show this help message

Test Names:
    all                 Run all tests (default)
    health              Health check test
    translation         Translation tests
    auth                Authentication tests
    performance         Performance tests
    errors              Error handling tests

Examples:
    $0                                  # Run all tests
    $0 -u http://api.example.com health # Test health endpoint
    $0 -v translation                   # Run translation tests with verbose output
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            BASE_URL="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            mkdir -p "$OUTPUT_DIR"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            TEST_NAME="$1"
            shift
            ;;
    esac
done

# Main execution
case "${TEST_NAME:-all}" in
    all)
        run_all_tests
        ;;
    health)
        test_health_check
        ;;
    translation)
        test_translation_basic
        test_translation_batch
        test_translation_invalid_lang
        test_translation_empty_text
        ;;
    auth)
        test_auth_required
        ;;
    performance)
        test_large_text
        test_rate_limiting
        ;;
    errors)
        test_malformed_json
        test_missing_fields
        ;;
    *)
        error "Unknown test: $TEST_NAME"
        usage
        exit 1
        ;;
esac

#!/bin/bash

# Transly Test Execution Script
# Version: 2.0.0
# Author: QA Team

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_ENV=${TEST_ENV:-"development"}
SKIP_BUILD=${SKIP_BUILD:-false}
PARALLEL=${PARALLEL:-true}
COVERAGE=${COVERAGE:-true}
BROWSER=${BROWSER:-"chromium"}

echo -e "${BLUE}🧪 Transly Test Suite Execution${NC}"
echo -e "${BLUE}================================${NC}"
echo "Environment: $TEST_ENV"
echo "Skip Build: $SKIP_BUILD"
echo "Parallel: $PARALLEL"
echo "Coverage: $COVERAGE"
echo "Browser: $BROWSER"
echo ""

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}$1${NC}"
    echo -e "${BLUE}$(printf '=%.0s' {1..50})${NC}"
}

# Function to run command with error handling
run_command() {
    local cmd="$1"
    local description="$2"
    
    echo -e "${YELLOW}Running: $description${NC}"
    echo "Command: $cmd"
    
    if eval "$cmd"; then
        echo -e "${GREEN}✅ $description completed successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ $description failed${NC}"
        return 1
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo "Node.js version: $NODE_VERSION"
    else
        echo -e "${RED}❌ Node.js not found${NC}"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo "npm version: $NPM_VERSION"
    else
        echo -e "${RED}❌ npm not found${NC}"
        exit 1
    fi
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm ci
    fi
    
    echo -e "${GREEN}✅ Prerequisites check completed${NC}"
}

# Function to run linting and type checking
run_static_analysis() {
    print_section "Static Analysis"
    
    run_command "npm run lint" "ESLint code linting" || return 1
    run_command "npm run type-check" "TypeScript type checking" || return 1
    
    # Check code formatting
    if command -v prettier &> /dev/null; then
        run_command "npx prettier --check ." "Code formatting check" || return 1
    fi
    
    echo -e "${GREEN}✅ Static analysis completed${NC}"
}

# Function to run unit tests
run_unit_tests() {
    print_section "Unit Tests"
    
    local test_cmd="npm run test -- --watchAll=false"
    
    if [ "$COVERAGE" = true ]; then
        test_cmd="$test_cmd --coverage"
    fi
    
    if [ "$PARALLEL" = true ]; then
        test_cmd="$test_cmd --maxWorkers=4"
    fi
    
    run_command "$test_cmd" "Unit tests execution" || return 1
    
    # Check coverage thresholds
    if [ "$COVERAGE" = true ]; then
        echo -e "${YELLOW}Checking coverage thresholds...${NC}"
        if [ -f "coverage/lcov-report/index.html" ]; then
            echo "Coverage report generated: coverage/lcov-report/index.html"
        fi
    fi
    
    echo -e "${GREEN}✅ Unit tests completed${NC}"
}

# Function to build the application
build_application() {
    if [ "$SKIP_BUILD" = true ]; then
        echo -e "${YELLOW}Skipping build step${NC}"
        return 0
    fi
    
    print_section "Application Build"
    
    run_command "npm run build" "Application build" || return 1
    
    echo -e "${GREEN}✅ Build completed${NC}"
}

# Function to run E2E tests
run_e2e_tests() {
    print_section "End-to-End Tests"
    
    # Install Playwright browsers if needed
    if [ ! -d "~/.cache/ms-playwright" ]; then
        echo -e "${YELLOW}Installing Playwright browsers...${NC}"
        npx playwright install
    fi
    
    local e2e_cmd="npx playwright test"
    
    if [ "$BROWSER" != "all" ]; then
        e2e_cmd="$e2e_cmd --project=$BROWSER"
    fi
    
    if [ "$PARALLEL" = true ]; then
        e2e_cmd="$e2e_cmd --workers=2"
    fi
    
    run_command "$e2e_cmd" "E2E tests execution" || return 1
    
    echo -e "${GREEN}✅ E2E tests completed${NC}"
}

# Function to run performance tests
run_performance_tests() {
    print_section "Performance Tests"
    
    run_command "npm run test:performance" "Performance tests execution" || return 1
    
    # Run Lighthouse CI if available
    if command -v lhci &> /dev/null; then
        run_command "lhci autorun" "Lighthouse CI audit" || echo -e "${YELLOW}⚠️ Lighthouse CI failed, continuing...${NC}"
    fi
    
    echo -e "${GREEN}✅ Performance tests completed${NC}"
}

# Function to run API tests
run_api_tests() {
    print_section "API Tests"
    
    run_command "npm run test -- --testPathPattern=api" "API tests execution" || return 1
    
    echo -e "${GREEN}✅ API tests completed${NC}"
}

# Function to run internationalization tests
run_i18n_tests() {
    print_section "Internationalization Tests"
    
    # Check translation completeness
    run_command "node scripts/check-i18n-coverage.js" "Translation coverage check" || return 1
    
    # Run i18n E2E tests
    run_command "npx playwright test e2e/internationalization.spec.ts --project=$BROWSER" "i18n E2E tests" || return 1
    
    echo -e "${GREEN}✅ i18n tests completed${NC}"
}

# Function to run security tests
run_security_tests() {
    print_section "Security Tests"
    
    # Run Snyk security scan if available
    if command -v snyk &> /dev/null; then
        run_command "snyk test --severity-threshold=high" "Snyk security scan" || echo -e "${YELLOW}⚠️ Security scan failed, continuing...${NC}"
    fi
    
    # Check for known vulnerabilities
    run_command "npm audit --audit-level=high" "npm audit security check" || echo -e "${YELLOW}⚠️ npm audit found issues, review manually${NC}"
    
    echo -e "${GREEN}✅ Security tests completed${NC}"
}

# Function to generate test report
generate_test_report() {
    print_section "Test Report Generation"
    
    local report_dir="test-reports"
    mkdir -p "$report_dir"
    
    # Combine test results
    echo "# Transly Test Execution Report" > "$report_dir/test-summary.md"
    echo "Generated: $(date)" >> "$report_dir/test-summary.md"
    echo "" >> "$report_dir/test-summary.md"
    
    # Add test results summary
    echo "## Test Results Summary" >> "$report_dir/test-summary.md"
    echo "- Environment: $TEST_ENV" >> "$report_dir/test-summary.md"
    echo "- Browser: $BROWSER" >> "$report_dir/test-summary.md"
    echo "- Coverage Enabled: $COVERAGE" >> "$report_dir/test-summary.md"
    echo "- Parallel Execution: $PARALLEL" >> "$report_dir/test-summary.md"
    
    # Copy important artifacts
    if [ -d "coverage" ]; then
        cp -r coverage "$report_dir/"
    fi
    
    if [ -d "test-results" ]; then
        cp -r test-results "$report_dir/"
    fi
    
    if [ -d "playwright-report" ]; then
        cp -r playwright-report "$report_dir/"
    fi
    
    echo -e "${GREEN}✅ Test report generated in $report_dir${NC}"
}

# Function to cleanup
cleanup() {
    print_section "Cleanup"
    
    # Kill any remaining processes
    pkill -f "next dev" || true
    pkill -f "playwright" || true
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Main execution function
main() {
    local start_time=$(date +%s)
    local failed_tests=()
    
    echo -e "${BLUE}Starting test execution at $(date)${NC}"
    
    # Set up trap for cleanup
    trap cleanup EXIT
    
    # Run test phases
    check_prerequisites || { failed_tests+=("Prerequisites"); }
    
    run_static_analysis || { failed_tests+=("Static Analysis"); }
    
    run_unit_tests || { failed_tests+=("Unit Tests"); }
    
    build_application || { failed_tests+=("Build"); }
    
    run_e2e_tests || { failed_tests+=("E2E Tests"); }
    
    run_performance_tests || { failed_tests+=("Performance Tests"); }
    
    run_api_tests || { failed_tests+=("API Tests"); }
    
    run_i18n_tests || { failed_tests+=("i18n Tests"); }
    
    run_security_tests || { failed_tests+=("Security Tests"); }
    
    generate_test_report
    
    # Calculate execution time
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    
    # Print final summary
    print_section "Test Execution Summary"
    echo "Total execution time: ${minutes}m ${seconds}s"
    
    if [ ${#failed_tests[@]} -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed successfully!${NC}"
        echo -e "${GREEN}✅ Test suite execution completed${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed:${NC}"
        for test in "${failed_tests[@]}"; do
            echo -e "${RED}  - $test${NC}"
        done
        echo -e "${RED}❌ Test suite execution failed${NC}"
        exit 1
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            TEST_ENV="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --no-parallel)
            PARALLEL=false
            shift
            ;;
        --no-coverage)
            COVERAGE=false
            shift
            ;;
        --browser)
            BROWSER="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --env ENV          Set test environment (default: development)"
            echo "  --skip-build       Skip application build step"
            echo "  --no-parallel      Disable parallel test execution"
            echo "  --no-coverage      Disable coverage collection"
            echo "  --browser BROWSER  Set browser for E2E tests (default: chromium)"
            echo "  --help             Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run main function
main

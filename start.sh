#!/usr/bin/env bash
# AlgoForge — unified dev launcher
# Usage: ./start.sh [--no-migrate] [--no-seed]

set -euo pipefail

# ─── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/algoforge-backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
LOG_DIR="$SCRIPT_DIR/.logs"

BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

BACKEND_PID=""
FRONTEND_PID=""

# ─── Flags ────────────────────────────────────────────────────────────────────
RUN_MIGRATE=true
for arg in "$@"; do
  [[ "$arg" == "--no-migrate" ]] && RUN_MIGRATE=false
done

# ─── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; }
header()  { echo -e "\n${BOLD}${CYAN}━━━  $*  ━━━${RESET}\n"; }

# ─── Cleanup ──────────────────────────────────────────────────────────────────
cleanup() {
  echo ""
  info "Shutting down AlgoForge..."
  [[ -n "$BACKEND_PID" ]]  && kill "$BACKEND_PID"  2>/dev/null && info "Backend stopped  (PID $BACKEND_PID)"
  [[ -n "$FRONTEND_PID" ]] && kill "$FRONTEND_PID" 2>/dev/null && info "Frontend stopped (PID $FRONTEND_PID)"
  # Kill any child processes in their process groups
  jobs -p | xargs -r kill 2>/dev/null || true
  success "All services stopped. Goodbye."
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# ─── Preflight checks ─────────────────────────────────────────────────────────
header "AlgoForge Dev Launcher"

if ! command -v python3 &>/dev/null; then
  error "python3 not found. Install Python 3.11+ and try again."
  exit 1
fi

PYTHON_MINOR=$(python3 -c "import sys; print(sys.version_info.minor)")
PYTHON_MAJOR=$(python3 -c "import sys; print(sys.version_info.major)")
if [[ "$PYTHON_MAJOR" -lt 3 || ( "$PYTHON_MAJOR" -eq 3 && "$PYTHON_MINOR" -lt 11 ) ]]; then
  warn "Python 3.11+ recommended. Found: $(python3 --version)"
fi

if ! command -v node &>/dev/null; then
  error "node not found. Install Node.js 18+ and try again."
  exit 1
fi

if ! command -v npm &>/dev/null; then
  error "npm not found. Install Node.js 18+ and try again."
  exit 1
fi

mkdir -p "$LOG_DIR"

# ─── Backend setup ────────────────────────────────────────────────────────────
header "Backend Setup"

# .env
if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  if [[ -f "$BACKEND_DIR/.env.example" ]]; then
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    warn ".env not found — copied from .env.example"
    warn "Edit $BACKEND_DIR/.env with your DATABASE_URL and SECRET_KEY before production use."
  else
    error "$BACKEND_DIR/.env not found and no .env.example to copy from."
    exit 1
  fi
else
  success ".env found"
fi

# Virtual environment
VENV_DIR="$BACKEND_DIR/venv"
if [[ ! -d "$VENV_DIR" ]]; then
  info "Creating Python virtual environment..."
  python3 -m venv "$VENV_DIR"
  success "Virtual environment created at $VENV_DIR"
else
  success "Virtual environment found"
fi

PYTHON="$VENV_DIR/bin/python"
PIP="$VENV_DIR/bin/pip"

# Install / sync dependencies
info "Installing Python dependencies..."
"$PIP" install --quiet --upgrade pip

# Use windows requirements (includes MetaTrader5) on Windows, base on Mac/Linux
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
  REQ_FILE="$BACKEND_DIR/requirements-windows.txt"
  info "Windows detected — using requirements-windows.txt (includes MetaTrader5)"
else
  REQ_FILE="$BACKEND_DIR/requirements.txt"
  info "macOS/Linux detected — MetaTrader5 skipped (Windows-only package)"
fi

"$PIP" install --quiet -r "$REQ_FILE" 2>&1 | tail -3
success "Python dependencies ready"

# Alembic migrations
if [[ "$RUN_MIGRATE" == true ]]; then
  info "Running Alembic migrations..."
  (
    cd "$BACKEND_DIR"
    # Attempt migration — skip gracefully if DB is not reachable
    if "$VENV_DIR/bin/alembic" upgrade head 2>&1; then
      :
    else
      warn "Alembic migration failed — DB may not be running yet. Skipping. (Use --no-migrate to suppress)"
    fi
  )
fi

# ─── Frontend setup ───────────────────────────────────────────────────────────
header "Frontend Setup"

# .env
if [[ ! -f "$FRONTEND_DIR/.env" ]]; then
  if [[ -f "$FRONTEND_DIR/.env.example" ]]; then
    cp "$FRONTEND_DIR/.env.example" "$FRONTEND_DIR/.env"
    warn ".env not found — copied from .env.example"
  else
    # Create a minimal one
    echo "VITE_API_URL=http://localhost:8000" > "$FRONTEND_DIR/.env"
    warn "Created minimal frontend .env with VITE_API_URL=http://localhost:8000"
  fi
else
  success ".env found"
fi

# Node modules
if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  info "Installing Node dependencies (this may take a minute)..."
  (cd "$FRONTEND_DIR" && npm install --silent)
  success "Node dependencies installed"
else
  success "node_modules found"
fi

# ─── Start services ───────────────────────────────────────────────────────────
header "Starting Services"

# Backend — uvicorn
info "Starting backend on http://localhost:8000 ..."
(
  cd "$BACKEND_DIR"
  export PYTHONUNBUFFERED=1
  "$VENV_DIR/bin/uvicorn" main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload \
    --log-level info \
    2>&1
) > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready (up to 15 s)
info "Waiting for backend to be ready..."
READY=false
for i in $(seq 1 30); do
  if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
    READY=true
    break
  fi
  sleep 0.5
done

if [[ "$READY" == true ]]; then
  success "Backend is up  →  http://localhost:8000"
  success "API docs       →  http://localhost:8000/docs"
else
  warn "Backend health check timed out — it may still be starting. Check $BACKEND_LOG"
fi

# Frontend — Vite dev server
info "Starting frontend on http://localhost:3000 ..."
(
  cd "$FRONTEND_DIR"
  npm run dev 2>&1
) > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to be ready (up to 20 s)
info "Waiting for frontend to be ready..."
READY=false
for i in $(seq 1 40); do
  if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    READY=true
    break
  fi
  sleep 0.5
done

if [[ "$READY" == true ]]; then
  success "Frontend is up  →  http://localhost:3000"
else
  warn "Frontend health check timed out — it may still be compiling. Check $FRONTEND_LOG"
fi

# ─── Status summary ───────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}━━━  AlgoForge is running  ━━━${RESET}"
echo ""
echo -e "  ${CYAN}Frontend${RESET}   http://localhost:3000"
echo -e "  ${CYAN}Backend${RESET}    http://localhost:8000"
echo -e "  ${CYAN}API Docs${RESET}   http://localhost:8000/docs"
echo -e "  ${CYAN}Health${RESET}     http://localhost:8000/health"
echo ""
echo -e "  Logs:  ${YELLOW}$BACKEND_LOG${RESET}"
echo -e "         ${YELLOW}$FRONTEND_LOG${RESET}"
echo ""
echo -e "  Press ${BOLD}Ctrl+C${RESET} to stop all services."
echo ""

# ─── Tail both logs side-by-side ──────────────────────────────────────────────
# Use a simple multiplexed tail so both logs stream to the terminal
tail -f "$BACKEND_LOG" | sed "s/^/${CYAN}[backend]${RESET} /" &
tail -f "$FRONTEND_LOG" | sed "s/^/${GREEN}[frontend]${RESET} /" &

# Keep the script alive until Ctrl+C
wait

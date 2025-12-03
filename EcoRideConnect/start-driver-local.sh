#!/bin/bash
# Start Driver App Local Development Environment

echo "🚀 Starting WARGO Partner (Driver) App..."
echo ""

# Start backend API server
echo "📡 Starting backend API server on port 5000..."
npm run dev &
API_PID=$!

# Wait for API to be ready
echo "⏳ Waiting for API server to start..."
sleep 5

# Start driver frontend
echo "🎨 Starting driver frontend on port 5174..."
npm run driver:dev &
DRIVER_PID=$!

echo ""
echo "✅ Services started!"
echo ""
echo "📝 Access points:"
echo "   - Driver App: http://localhost:5174/"
echo "   - API Server: http://localhost:5000/"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for interrupt
trap "echo ''; echo '🛑 Stopping services...'; kill $API_PID $DRIVER_PID 2>/dev/null; exit" INT TERM

wait

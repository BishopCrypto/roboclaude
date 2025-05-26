#!/bin/bash

# Test script for ESC detection feature
echo "🚀 Starting Robotron 2084 ESC Detection Test"
echo ""
echo "This will:"
echo "1. Start the game development server"
echo "2. Launch browser with ESC detection"
echo "3. Test the double ESC close feature"
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in the right directory. Please run from the roboclaude folder."
    exit 1
fi

# Start the development server in background
echo "📦 Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Check if server is running by testing the URL
if curl -s -f http://localhost:5174 > /dev/null; then
    echo "✅ Development server is running"
else
    echo "❌ Development server failed to start"
    kill $DEV_SERVER_PID 2>/dev/null
    exit 1
fi

# Launch the ESC detection debugger
echo "🔍 Launching ESC detection debugger..."
npm run debug-esc

# Cleanup: Kill the development server when done
echo ""
echo "🧹 Cleaning up..."
kill $DEV_SERVER_PID 2>/dev/null
echo "✅ Development server stopped"
echo "✅ Test complete!"

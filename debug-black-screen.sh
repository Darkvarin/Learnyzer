#!/bin/bash

echo "DEBUGGING BLACK SCREEN ISSUE"
echo "============================"

cd /home/ubuntu/Learnyzer

echo "1. Checking if JavaScript is loading..."
curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.js' | head -1

echo ""
echo "2. Testing JavaScript file directly..."
js_file=$(curl -s https://learnyzer.com/dashboard | grep -o '/assets/index-[^"]*\.js' | head -1)
if [ -n "$js_file" ]; then
    js_response=$(curl -s -o /dev/null -w "%{http_code}" "https://learnyzer.com$js_file")
    echo "JavaScript response: $js_response"
else
    echo "No JavaScript file found in HTML"
fi

echo ""
echo "3. Checking console errors by examining React Router setup..."
curl -s https://learnyzer.com/dashboard | grep -A5 -B5 "root\|app"

echo ""
echo "4. Checking if the issue is with useLocation hook import..."
grep -n "useLocation" client/src/components/layout/header.tsx

echo ""
echo "5. Let's see the current header import structure..."
head -10 client/src/components/layout/header.tsx

echo ""
echo "6. Checking if App.tsx is using the right dashboard..."
grep "Dashboard" client/src/App.tsx
EOF

chmod +x debug-black-screen.sh
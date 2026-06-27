#!/bin/bash
cd backend && node app.js &
cd frontend-read && npm run dev &
cd frontend-write && npm run dev &
wait

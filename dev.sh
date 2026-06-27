#!/bin/bash
cd backend && node app.js &
cd frontend && npm run dev &
wait

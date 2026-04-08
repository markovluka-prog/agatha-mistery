#!/usr/bin/env node
// Однократный запуск для GitHub Actions — устанавливает SINGLE_RUN=true и запускает agent.js
process.env.SINGLE_RUN = 'true';
require('./agent.js');

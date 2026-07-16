import app from './app.js';

// Define the port for the Express Gateway
const PORT = process.env.PORT || 5000;

// Boot up the server engine
app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(` 🚀 CORE_HIRE BACKEND ENGINE ONLINE`);
  console.log(`=================================================`);
  console.log(` - Gateway Port       : ${PORT}`);
  console.log(` - Environment        : ${process.env.NODE_ENV || 'development'}`);
  console.log(` - Health Telemetry   : http://localhost:${PORT}/api/health`);
  console.log(`=================================================\n`);
});
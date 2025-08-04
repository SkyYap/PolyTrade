/**
 * Simple logger utility
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const logger = {
  info: (message) => {
    console.log(`${colors.blue}[INFO]${colors.reset} ${message}`);
  },
  
  success: (message) => {
    console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
  },
  
  warning: (message) => {
    console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
  },
  
  error: (message) => {
    console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
  },
  
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${colors.magenta}[DEBUG]${colors.reset} ${message}`);
    }
  },
};

module.exports = logger;
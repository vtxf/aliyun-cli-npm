const { spawn } = require('child_process');
const fs = require('fs');
const { getExecutablePath } = require('./platform');
const { downloadBinary } = require('./downloader');

async function executeAliyunCli(args) {
  let executablePath = getExecutablePath();
  
  if (!fs.existsSync(executablePath)) {
    console.log('🔍 Binary not found, initiating download...\n');
    try {
      executablePath = await downloadBinary();
    } catch (error) {
      console.error('\n❌ Failed to download aliyun-cli binary.');
      console.error('Error:', error.message);
      console.error('\n💡 Troubleshooting tips:');
      console.error('1. Check your internet connection');
      console.error('2. Try again later - download sources might be temporarily unavailable');
      console.error('3. If the problem persists, you can manually download and install:');
      console.error('   - Visit: https://github.com/aliyun/aliyun-cli/releases');
      console.error('   - Download the binary for your platform');
      console.error(`   - Place it in: ${executablePath}`);
      process.exit(1);
    }
  }
  
  if (!fs.existsSync(executablePath)) {
    console.error(`❌ Error: Cannot find aliyun binary at: ${executablePath}`);
    console.error('Please check if npm package is correctly installed.');
    process.exit(1);
  }

  const platform = process.platform;
  
  if (platform !== 'win32') {
    try {
      fs.chmodSync(executablePath, '755');
    } catch (err) {
      console.warn(`⚠️  Warning: Unable to set executable permissions: ${err.message}`);
    }
  }

  const aliyun = spawn(executablePath, args, {
    stdio: 'inherit'
  });

  aliyun.on('error', (err) => {
    console.error(`❌ Error starting aliyun: ${err.message}`);
    console.error('The binary file might be corrupted or incompatible with your system.');
    console.error('💡 Try deleting the binary and run the command again to re-download.');
    console.error(`Binary location: ${executablePath}`);
    process.exit(1);
  });

  aliyun.on('exit', (code) => {
    process.exit(code || 0);
  });
}

module.exports = {
  executeAliyunCli
};

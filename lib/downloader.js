const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createReadStream, createWriteStream } = require('fs');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);
const { getPlatformInfo } = require('./platform');

const VERSION = '3.3.17';

const DOWNLOAD_SOURCES = [
  {
    name: 'Aliyun CDN',
    priority: 1,
    urls: {
      'windows-amd64': 'https://aliyuncli.alicdn.com/aliyun-cli-windows-latest-amd64.zip',
      'mac-amd64': 'https://aliyuncli.alicdn.com/aliyun-cli-macosx-latest-universal.tgz',
      'mac-arm64': 'https://aliyuncli.alicdn.com/aliyun-cli-macosx-latest-universal.tgz',
      'linux-amd64': 'https://aliyuncli.alicdn.com/aliyun-cli-linux-latest-amd64.tgz'
    }
  },
  {
    name: 'GitHub Releases',
    priority: 2,
    urls: {
      'windows-amd64': `https://github.com/aliyun/aliyun-cli/releases/download/v${VERSION}/aliyun-cli-windows-amd64.zip`,
      'mac-amd64': `https://github.com/aliyun/aliyun-cli/releases/download/v${VERSION}/aliyun-cli-macosx-amd64.tgz`,
      'mac-arm64': `https://github.com/aliyun/aliyun-cli/releases/download/v${VERSION}/aliyun-cli-macosx-arm64.tgz`,
      'linux-amd64': `https://github.com/aliyun/aliyun-cli/releases/download/v${VERSION}/aliyun-cli-linux-amd64.tgz`
    }
  },
  {
    name: 'GitHub Mirror',
    priority: 3,
    urls: {
      'windows-amd64': `https://ghproxy.com/https://github.com/aliyun/aliyun-cli/releases/download/v${VERSION}/aliyun-cli-windows-amd64.zip`,
      'mac-amd64': `https://ghproxy.com/https://github.com/aliyun/aliyun-cli/releases/download/v${VERSION}/aliyun-cli-macosx-amd64.tgz`,
      'mac-arm64': `https://ghproxy.com/https://github.com/aliyun/aliyun-cli/releases/download/v${VERSION}/aliyun-cli-macosx-arm64.tgz`,
      'linux-amd64': `https://ghproxy.com/https://github.com/aliyun/aliyun-cli/releases/download/v${VERSION}/aliyun-cli-linux-amd64.tgz`
    }
  }
];

function getDownloadSources(platformKey) {
  return DOWNLOAD_SOURCES
    .map(source => ({
      ...source,
      url: source.urls[platformKey]
    }))
    .filter(source => source.url)
    .sort((a, b) => a.priority - b.priority);
}

function getDownloadUrl() {
  const platformInfo = getPlatformInfo();
  const platformKey = `${platformInfo.platform}-${platformInfo.arch}`;
  const sources = getDownloadSources(platformKey);
  return sources[0]?.url;
}

async function downloadWithProgress(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const tempPath = destPath + '.download';
    
    const options = {
      headers: {
        'User-Agent': 'aliyun-cli-npm'
      }
    };
    
    protocol.get(url, options, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        const redirectUrl = response.headers.location;
        console.log(`Following redirect to: ${redirectUrl}`);
        downloadWithProgress(redirectUrl, destPath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10) || 0;
      let downloadedSize = 0;
      const startTime = Date.now();
      
      const file = createWriteStream(tempPath);
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        
        if (totalSize > 0) {
          const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
          const speed = Math.round(downloadedSize / ((Date.now() - startTime) / 1000) / 1024);
          const remaining = Math.round((totalSize - downloadedSize) / speed / 1024);
          
          process.stdout.write(`\r⏳ Downloading: ${progress}% (${(downloadedSize / 1024 / 1024).toFixed(1)}MB/${(totalSize / 1024 / 1024).toFixed(1)}MB) - ${speed}KB/s - ${remaining}s remaining`);
        }
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('\n✅ Download completed!');
        
        fs.renameSync(tempPath, destPath);
        resolve(destPath);
      });
      
      file.on('error', (err) => {
        fs.unlink(tempPath, () => {});
        reject(err);
      });
      
      response.on('error', (err) => {
        file.destroy();
        fs.unlink(tempPath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(new Error(`Network error: ${err.message}`));
    });
  });
}

async function extractArchive(archivePath, destDir) {
  const { execSync } = require('child_process');
  
  console.log('📦 Extracting archive...');
  
  try {
    if (archivePath.endsWith('.zip')) {
      if (process.platform === 'win32') {
        execSync(`tar -xf "${archivePath}" -C "${destDir}"`, { stdio: 'inherit' });
      } else {
        execSync(`unzip -o "${archivePath}" -d "${destDir}"`, { stdio: 'inherit' });
      }
    } else if (archivePath.endsWith('.tgz') || archivePath.endsWith('.tar.gz')) {
      execSync(`tar -xzf "${archivePath}" -C "${destDir}"`, { stdio: 'inherit' });
    } else {
      throw new Error('Unsupported archive format');
    }
    
    console.log('✅ Extraction completed!');
    return true;
  } catch (error) {
    throw new Error(`Extraction failed: ${error.message}`);
  }
}

async function findExecutableInDir(dir) {
  const platformInfo = getPlatformInfo();
  const executableName = platformInfo.platform === 'windows' ? 'aliyun.exe' : 'aliyun';
  
  function searchDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const result = searchDir(fullPath);
        if (result) return result;
      } else if (item === executableName) {
        return fullPath;
      }
    }
    
    return null;
  }
  
  return searchDir(dir);
}

async function downloadBinary() {
  const platformInfo = getPlatformInfo();
  const platformKey = `${platformInfo.platform}-${platformInfo.arch}`;
  
  if (!DOWNLOAD_SOURCES[0].urls[platformKey]) {
    throw new Error(`Unsupported platform: ${platformKey}`);
  }
  
  const binDir = path.join(__dirname, '..', 'bin');
  const platformDir = path.join(binDir, platformKey);
  const tempDir = path.join(binDir, 'temp-' + platformKey);
  
  const executableName = platformInfo.platform === 'windows' ? 'aliyun.exe' : 'aliyun';
  const executablePath = path.join(platformDir, executableName);
  
  if (fs.existsSync(executablePath)) {
    console.log('✅ Binary already exists, skipping download.');
    return executablePath;
  }
  
  const sources = getDownloadSources(platformKey);
  
  for (const source of sources) {
    try {
      console.log(`📡 Trying source: ${source.name} (${source.url})`);
      
      await fs.promises.mkdir(tempDir, { recursive: true });
      await fs.promises.mkdir(platformDir, { recursive: true });
      
      const fileName = path.basename(source.url);
      const archivePath = path.join(tempDir, fileName);
      
      await downloadWithProgress(source.url, archivePath);
      
      await extractArchive(archivePath, tempDir);
      
      const extractedBinary = await findExecutableInDir(tempDir);
      
      if (!extractedBinary) {
        throw new Error('Could not find executable in extracted archive');
      }
      
      fs.copyFileSync(extractedBinary, executablePath);
      
      fs.rmSync(tempDir, { recursive: true, force: true });
      
      if (process.platform !== 'win32') {
        fs.chmodSync(executablePath, '755');
      }
      
      console.log(`✅ Successfully installed aliyun-cli to ${executablePath}`);
      return executablePath;
      
    } catch (error) {
      console.error(`❌ Failed to download from ${source.name}: ${error.message}`);
      
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError.message);
      }
      
      if (source === sources[sources.length - 1]) {
        throw new Error(`All download sources failed. Last error: ${error.message}`);
      }
      
      console.log('⏭️  Trying next source...\n');
    }
  }
}

module.exports = {
  downloadBinary,
  getDownloadUrl,
  DOWNLOAD_SOURCES
};

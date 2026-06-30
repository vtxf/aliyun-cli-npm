const os = require('os');
const path = require('path');

function getPlatformInfo() {
  const platform = os.platform();
  const arch = os.arch();

  const platformMap = {
    'win32': 'windows',
    'darwin': 'mac',
    'linux': 'linux'
  };

  const archMap = {
    'x32': '386',
    'x64': 'amd64',
    'arm': 'arm',
    'arm64': 'arm64',
    'ia32': '386'
  };

  const aliyunPlatform = platformMap[platform] || platform;
  const aliyunArch = archMap[arch] || arch;

  return {
    platform: aliyunPlatform,
    arch: aliyunArch,
    original: { platform, arch }
  };
}

function getExecutablePath() {
  const platformInfo = getPlatformInfo();
  const binDir = path.join(__dirname, '..', 'bin');
  const platformDir = `${platformInfo.platform}-${platformInfo.arch}`;
  
  const executableDir = path.join(binDir, platformDir);
  
  if (platformInfo.platform === 'windows') {
    return path.join(executableDir, 'aliyun.exe');
  } else {
    return path.join(executableDir, 'aliyun');
  }
}

function getBinaryDirectory() {
  const platformInfo = getPlatformInfo();
  const binDir = path.join(__dirname, '..', 'bin');
  return path.join(binDir, `${platformInfo.platform}-${platformInfo.arch}`);
}

module.exports = {
  getPlatformInfo,
  getExecutablePath,
  getBinaryDirectory
};

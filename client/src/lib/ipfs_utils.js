import IpfsApi from 'ipfs-api';
import Base58 from 'bs58';

const defaultConfig = {
  host: 'localhost',
  port: 5001,
  timeout: 5000,
};

function getIpfs(config) {
  return IpfsApi(config.host, config.port);
}

export function addFile(content, _config) {
  const config = _config ? { ...defaultConfig, ..._config } : defaultConfig;

  return new Promise((resolve, reject) => {
    const ipfs = getIpfs(config);
    const buffer = Buffer.from(content);

    ipfs.files.add(buffer, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result[0].hash);
    });
  });
}

export function getFile(multihash, _config) {
  const config = _config ? { ...defaultConfig, ..._config } : defaultConfig;

  return new Promise((resolve, reject) => {
    setTimeout(
      () => reject({ message: 'TimeoutError' }),
      config.timeout,
    );

    const ipfs = getIpfs(config);

    ipfs.files.get(multihash, (error, files) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(files[0].content);
    });
  });
}

export function getJson(multihash, _config) {
  const config = _config ? { ...defaultConfig, ..._config } : defaultConfig;

  return new Promise((resolve, reject) => {
    getFile(multihash, config)
      .then((content) => {
        const json = JSON.parse(content);
        resolve(json);
      })
      .catch(reject);
  });
}

export function multihashToBytes32(multihash) {
  return `0x${Base58.decode(multihash).slice(2).toString('hex')}`;
}

export function bytes32ToMultihash(bytes) {
  return Base58.encode(Buffer.from(`1220${bytes.slice(2)}`, 'hex'));
}

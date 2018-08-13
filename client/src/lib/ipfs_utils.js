import IpfsApi from 'ipfs-api';
import Base58 from 'bs58';

const defaultConfig = {
  host: 'localhost',
  port: 5001,
};

function getIpfs(config) {
  return IpfsApi(config.host, config.port);
}

export function addFile(content, config = defaultConfig) {
  return new Promise((resolve, reject) => {
    const ipfs = getIpfs(config);
    const buffer = Buffer.from(content);

    ipfs.files.add(buffer, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result[0].hash);
    });
  });
}

export function getFile(multihash, config = defaultConfig) {
  return new Promise((resolve, reject) => {
    const ipfs = getIpfs(config);

    ipfs.files.get(multihash, (error, files) => {
      if (error) {
        reject(error);
      }

      console.log(files[0]);
    });
  });
}

export function getJson(multihash, config = defaultConfig) {
  return new Promise((resolve, reject) => {
    const ipfs = getIpfs(config);

    ipfs.files.get(multihash, (error, files) => {
      if (error) {
        reject(error);
        return;
      }

      const file = files[0];
      const content = file.content.toString();
      const json = JSON.parse(content);
      resolve(json);
    });
  });
}

export function multihashToBytes32(multihash) {
  return `0x${Base58.decode(multihash).slice(2).toString('hex')}`;
}

export function bytes32ToMultihash(bytes) {
  return Base58.encode(Buffer.from(`1220${bytes.slice(2)}`, 'hex'));
}

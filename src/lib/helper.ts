const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const toHexString = (bytes: Uint8Array) =>
  "0x" +
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

export { formatAddress, toHexString };

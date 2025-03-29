const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const toHexString = (bytes: Uint8Array) =>
  "0x" +
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

const formatTime = (seconds: number, shortFormat: boolean = false): string => {
  if (!seconds) return shortFormat ? "0s" : "0 seconds";

  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (days > 0)
    parts.push(`${days}${shortFormat ? "d" : ` day${days !== 1 ? "s" : ""}`}`);
  if (hours > 0)
    parts.push(
      `${hours}${shortFormat ? "h" : ` hour${hours !== 1 ? "s" : ""}`}`
    );
  if (minutes > 0)
    parts.push(
      `${minutes}${shortFormat ? "m" : ` minute${minutes !== 1 ? "s" : ""}`}`
    );
  if (remainingSeconds > 0)
    parts.push(
      `${remainingSeconds}${
        shortFormat ? "s" : ` second${remainingSeconds !== 1 ? "s" : ""}`
      }`
    );

  return parts.join(shortFormat ? " " : ", ");
};

export { formatAddress, toHexString, formatTime };

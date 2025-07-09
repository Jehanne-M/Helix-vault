/**
 * @param {string} value - The value to validate.
 * @returns {boolean} - Returns true if the windows drive letter is valid, otherwise false.
 * @description - Validates if the given value is a valid Windows drive letter.
 */
export const isValidWindowsDriveLetter = (value: string): boolean => {
  // Regular expression to match a valid Windows drive letter (e.g., C:, D:, E:)
  const windowsDriveLetterRegex =
    /^(?:[A-Z]:\\$|^[A-Z]:?$|^[A-Z]$|^\/[a-zA-Z]+(?:$|\/))/i;

  // Test the value against the regex
  return windowsDriveLetterRegex.test(value);
};

/**
 * @param {string} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a valid domain name, otherwise false.
 * @description - Validates if the given value is a valid domain name.
 */
export const isDomainName = (value: string): boolean => {
  // Regular expression to match a valid domain name
  const domainNameRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

  // Test the value against the regex
  return domainNameRegex.test(value);
};

/**
 * @param {string} value - The value to validate.
 * @returns {boolean} - Returns true if the value is a valid IPv4 address, otherwise false.
 * @description - Validates if the given value is a valid IPv4 address.
 */
export const isIPv4Address = (value: string): boolean => {
  // Regular expression to match a valid IPv4 address
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // Test the value against the regex
  return ipv4Regex.test(value);
};

export const stringType = (value: string): string => {
  const trimString = value.trim();
  if (isValidWindowsDriveLetter(trimString)) {
    return 'windows-drive-letter';
  } else if (isDomainName(trimString)) {
    return 'domain-name';
  } else if (isIPv4Address(trimString)) {
    return 'ipv4-address';
  } else {
    return 'unknown';
  }
};

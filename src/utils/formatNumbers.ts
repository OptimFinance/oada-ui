export const formatNumberWithSuffix = (num: number | undefined, decimals: number = 0) => {
  if (!num) return "-";
  const factor = Math.pow(10, decimals)
  const units = num / factor
  if (units >= 1000000) {
    return parseFloat((units / 1000000).toFixed(1)) + "M";
  } else if (units >= 1000) {
    return parseFloat((units / 1000).toFixed(1)) + "k";
  } else {
    return formatDecimals(units, 2)
  }
};

export const formatNumberWithCommas = (num: number | undefined) => {
  if (num === undefined) return "-";
  return num.toLocaleString();
};

export const formatPercent = (num: number | undefined) => {
  return `${formatDecimals(num && num * 100, 2)}%`
};

export const formatDecimals = (num: number | undefined, places = 2) => {
  if (!num) return "-";
  const factor = Math.pow(10, places)
  return `${Math.round((num) * factor) / factor}`
};

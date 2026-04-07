/**
 * Convert the date format of YYYY-MM-DD to Chinese writing.
 * @param date The date in format of YYYY-MM-DD.
 */
export const normalizeDateZh = (date = "1970-01-01"): string => {
  const [year, month, day] = date.split("-");
  const monthNum = Number.parseInt(month, 10);
  const dayNum = Number.parseInt(day, 10);

  if (!year || Number.isNaN(monthNum) || Number.isNaN(dayNum)) {
    return date;
  }

  return `${year}年${monthNum}月${dayNum}日`;
};

export const getCurrentTime = (): {
  year: string;
  month: string;
  day: string;
  hours: string;
  minutes: string;
  seconds: string;
} => {
  const today = new Date();
  return {
    year: today.getFullYear().toString(),
    month: String(today.getMonth() + 1).padStart(2, "0"),
    day: String(today.getDate()).padStart(2, "0"),
    hours: String(today.getHours()).padStart(2, "0"),
    minutes: String(today.getMinutes()).padStart(2, "0"),
    seconds: String(today.getSeconds()).padStart(2, "0"),
  };
};

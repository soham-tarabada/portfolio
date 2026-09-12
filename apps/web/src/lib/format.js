const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatMonth(value) {
  if (!value) return "Present";
  const [year, month] = String(value).split("-");
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : String(value);
}

export function formatRange(start, end, current) {
  return `${formatMonth(start)} — ${current || !end ? "Present" : formatMonth(end)}`;
}

export function pluralise(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural || `${singular}s`}`;
}

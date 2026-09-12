import { useEffect, useState } from "react";

const FORMATTER = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Kolkata",
});

export function useClock() {
  const [time, setTime] = useState(() => FORMATTER.format(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(FORMATTER.format(new Date()));
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);

  return time;
}

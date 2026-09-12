import { useCallback, useRef, useState } from "react";
import { EMPTY_CONTACT, validateContact, sendContact } from "./contact.js";

export function useContactForm({ session, onSent } = {}) {
  const [values, setValues] = useState(EMPTY_CONTACT);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle");
  const [failure, setFailure] = useState(null);
  const openedAt = useRef(Date.now());

  const set = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const { [field]: removed, ...rest } = current;
      return rest;
    });
  }, []);

  const blur = useCallback((field) => {
    setTouched((current) => ({ ...current, [field]: true }));
  }, []);

  const submit = useCallback(async () => {
    const found = validateContact(values);
    setErrors(found);
    setTouched({ name: true, email: true, subject: true, company: true, body: true });

    if (Object.keys(found).length > 0) {
      setStatus("invalid");
      return false;
    }

    setStatus("sending");
    setFailure(null);

    try {
      await sendContact(values, {
        dwellMs: Date.now() - openedAt.current,
        path: window.location.pathname,
        referrer: document.referrer,
        session,
      });

      setValues(EMPTY_CONTACT);
      setTouched({});
      openedAt.current = Date.now();
      setStatus("sent");
      onSent?.();
      return true;
    } catch (error) {
      setFailure(error.message);
      setStatus("failed");
      return false;
    }
  }, [values, session, onSent]);

  const reset = useCallback(() => {
    setStatus("idle");
    setFailure(null);
  }, []);

  return { values, errors, touched, status, failure, set, blur, submit, reset };
}

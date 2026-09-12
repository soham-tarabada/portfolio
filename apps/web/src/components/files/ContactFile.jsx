import { CodeSurface, Line, Blank, Punct, Key, Str, Note } from "../CodeSurface.jsx";
import { useCopy } from "../../lib/useCopy.js";
import { useContactForm } from "../../lib/useContactForm.js";
import { CONTACT_LIMITS } from "../../lib/contact.js";

function CopyButton({ value, label, copiedKey, onCopy }) {
  const copied = copiedKey === label;
  return (
    <button
      type="button"
      className="copy"
      onClick={() => onCopy(value, label)}
      aria-label={`Copy ${label}`}
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

function FormField({ id, label, hint, error, showError, children }) {
  return (
    <div className="mail__field">
      <label className="mail__label" htmlFor={id}>
        <span className="mail__key">{label}</span>
        {hint ? <span className="mail__hint">{hint}</span> : null}
      </label>
      {children}
      {showError ? (
        <p className="mail__error" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function MessageForm({ session, track }) {
  const form = useContactForm({
    session,
    onSent: () => track?.("contact", "sent", "/contact"),
  });
  const { values, errors, touched, status, failure, set, blur, submit } = form;

  const invalid = (field) => Boolean(errors[field]) && Boolean(touched[field]);
  const describe = (field) => (invalid(field) ? `mail-${field}-error` : undefined);

  if (status === "sent") {
    return (
      <div className="mail__done" role="status">
        <p className="mail__done-mark" aria-hidden="true">
          ✓
        </p>
        <p className="mail__done-text">
          Delivered. I read every message that lands here and reply from my own address.
        </p>
        <button type="button" className="mail__submit" onClick={form.reset}>
          write another
        </button>
      </div>
    );
  }

  const remaining = CONTACT_LIMITS.body.max - values.body.length;

  return (
    <form
      className="mail__form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <FormField
        id="mail-name"
        label="name"
        error={errors.name}
        showError={invalid("name")}
      >
        <input
          id="mail-name"
          className="mail__input"
          value={values.name}
          maxLength={CONTACT_LIMITS.name.max}
          autoComplete="name"
          aria-invalid={invalid("name")}
          aria-describedby={describe("name")}
          onChange={(event) => set("name", event.target.value)}
          onBlur={() => blur("name")}
        />
      </FormField>

      <FormField
        id="mail-email"
        label="email"
        error={errors.email}
        showError={invalid("email")}
      >
        <input
          id="mail-email"
          type="email"
          className="mail__input"
          value={values.email}
          maxLength={CONTACT_LIMITS.email.max}
          autoComplete="email"
          aria-invalid={invalid("email")}
          aria-describedby={describe("email")}
          onChange={(event) => set("email", event.target.value)}
          onBlur={() => blur("email")}
        />
      </FormField>

      <FormField id="mail-company" label="company" hint="optional">
        <input
          id="mail-company"
          className="mail__input"
          value={values.company}
          maxLength={CONTACT_LIMITS.company.max}
          autoComplete="organization"
          onChange={(event) => set("company", event.target.value)}
        />
      </FormField>

      <FormField id="mail-subject" label="subject" hint="optional">
        <input
          id="mail-subject"
          className="mail__input"
          value={values.subject}
          maxLength={CONTACT_LIMITS.subject.max}
          onChange={(event) => set("subject", event.target.value)}
        />
      </FormField>

      <FormField
        id="mail-body"
        label="message"
        hint={`${remaining} left`}
        error={errors.body}
        showError={invalid("body")}
      >
        <textarea
          id="mail-body"
          className="mail__input mail__input--area"
          rows={7}
          value={values.body}
          maxLength={CONTACT_LIMITS.body.max}
          aria-invalid={invalid("body")}
          aria-describedby={describe("body")}
          onChange={(event) => set("body", event.target.value)}
          onBlur={() => blur("body")}
        />
      </FormField>

      <div className="mail__trap" aria-hidden="true">
        <label htmlFor="mail-website">Website</label>
        <input
          id="mail-website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => set("website", event.target.value)}
        />
      </div>

      {failure ? (
        <p className="mail__failure" role="alert">
          {failure}
        </p>
      ) : null}

      <div className="mail__foot">
        <button type="submit" className="mail__submit" disabled={status === "sending"}>
          {status === "sending" ? "transmitting…" : "send"}
        </button>
        <span className="mail__note">No tracking pixels. Straight into my inbox.</span>
      </div>
    </form>
  );
}

export default function ContactFile({ content, session, track }) {
  const { profile } = content;
  const { copiedKey, copy } = useCopy();

  const variables = [
    { name: "EMAIL", value: profile.email, copyable: true },
    { name: "PHONE", value: profile.phone, copyable: true },
    { name: "LOCATION", value: profile.location, copyable: false },
    { name: "TIMEZONE", value: profile.timezone, copyable: false },
  ].filter((entry) => entry.value);

  return (
    <div className="split">
      <div className="split__main">
        <CodeSurface label="Contact">
          <Line>
            <Note>#!/usr/bin/env bash</Note>
          </Line>
          <Line>
            <Note># Get in touch. I read everything that arrives here.</Note>
          </Line>
          <Blank />

          {variables.map((entry) => (
            <Line key={entry.name}>
              <Key>{entry.name}</Key>
              <Punct>=</Punct>
              <Str>&quot;{entry.value}&quot;</Str>
              {entry.copyable ? (
                <CopyButton
                  value={entry.value}
                  label={entry.name.toLowerCase()}
                  copiedKey={copiedKey}
                  onCopy={copy}
                />
              ) : null}
            </Line>
          ))}

          <Blank />
          <Line>
            <Note># Profiles</Note>
          </Line>

          {profile.socials.map((social) => (
            <Line key={social.platform}>
              <Key>open</Key>{" "}
              <a
                className="link"
                href={social.url}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => track?.("social", social.platform, "/contact")}
              >
                <Str>&quot;{social.url}&quot;</Str>
              </a>
              <span className="trail">
                <Note># {social.label}</Note>
              </span>
            </Line>
          ))}

          <Blank />
          <Line>
            <Note># Or use the form — it writes straight to my admin inbox.</Note>
          </Line>
        </CodeSurface>
      </div>

      <aside className="mail" aria-label="Send a message">
        <div className="mail__head">
          <span>New message</span>
          <span className="mail__to">to {profile.email}</span>
        </div>
        <div className="mail__body">
          <MessageForm session={session} track={track} />
        </div>
      </aside>
    </div>
  );
}

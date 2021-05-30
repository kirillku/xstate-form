import * as React from "react";

export const ErrorMessage = ({ children: error }) =>
  error ? <div className="ErrorMessage">{error}</div> : null;

export const Input = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text"
}) => (
  <label className="Input-label">
    <div>{label}</div>
    <input name={name} value={value} onChange={onChange} type={type} />
    <ErrorMessage>{error}</ErrorMessage>
  </label>
);

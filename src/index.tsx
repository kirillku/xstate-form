import "./styles.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createFormMachine, useFormMachine } from "./xstate-form";
import { Input, ErrorMessage } from "./components";
import { postForm, validateEmail } from "./api";

const initialValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: ""
};

const validations = {
  name: ({ name }) => {
    if (!name) {
      return "Name is required.";
    }
    if (name.length < 3) {
      return "Name should be longer than 3 characters.";
    }
  },
  email: ({ email }) => {
    if (!email) {
      return "Email is required.";
    }
    if (!email.includes("@")) {
      return "Email is invalid.";
    }
  },
  password: ({ password }) => {
    if (password?.length < 8) {
      return "Password should be at least 8 characters.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password should have at least one uppercase letter.";
    }
    if (!/[a-z]/.test(password)) {
      return "Password should have at least one lowercase letter.";
    }
    if (!/\d/.test(password)) {
      return "Password should have at least one digit.";
    }
  },
  confirmPassword: ({ password, confirmPassword }) => {
    if (password !== confirmPassword) {
      return "Password should match.";
    }
  }
};

const formMachine = createFormMachine({
  initialValues,
  onSubmit: postForm,
  validations,
  asyncValidations: { email: validateEmail }
});

const App = () => {
  const {
    values,
    errors,
    handleSubmit,
    handleChange,
    isLoading,
    hasSubmittingError,
    isSubmitted
  } = useFormMachine<typeof initialValues>(formMachine);

  if (isSubmitted) {
    return (
      <div className="App">
        <h1>{values.name}, Welcome to XState Form!</h1>
        <p>The form was submitted successesfully.</p>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>XState Form</h1>
      <form onSubmit={handleSubmit}>
        <Input
          label="Name"
          name="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Input
          label="Email"
          name="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        {hasSubmittingError && (
          <ErrorMessage>{errors.non_field_errors}</ErrorMessage>
        )}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : hasSubmittingError ? "Retry" : "Submit"}
        </button>
      </form>
    </div>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

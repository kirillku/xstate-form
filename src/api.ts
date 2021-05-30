const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const postForm = (values) =>
  delay(2000).then(() => {
    if (values.name === "Error") {
      return Promise.reject({ non_field_errors: "It's just not possible!" });
    }

    if (values.email === "example@example.com") {
      return Promise.reject({ email: "This email is already taken." });
    }
  });

export const validateEmail = (values) =>
  delay(1000).then(() => {
    if (values.email === "async@example.com") {
      return Promise.reject("This email is already taken.");
    }
  });

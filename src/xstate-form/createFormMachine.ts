import { assign, createMachine } from "xstate";

const omit = (object, keys) => {
  const newObject = { ...object };
  keys.forEach((key) => delete newObject[key]);
  return newObject;
};

export type Validator<T extends {}> = (values: T) => string | undefined;

export type AsyncValidator<T extends {}> = (
  values: T
) => Promise<any /*, string */>;

export type SubmitError<T extends {}> = Partial<
  Record<keyof T | "non_field_errors", string>
>;

export type SubmitFunction<T extends {}> = (
  values: T
) => Promise<any /*, SubmitError<T> */>;

export const createFormMachine = <T extends {}>({
  initialValues,
  onSubmit,
  validations,
  asyncValidations
}: {
  initialValues: T;
  onSubmit: SubmitFunction<T>;
  validations?: Partial<Record<keyof T, Validator<T>>>;
  asyncValidations?: Partial<Record<keyof T, AsyncValidator<T>>>;
}) => {
  const draftStates = {};
  Object.keys(initialValues).forEach((field) => {
    const fieldState = {
      initial: "valid",
      states: {
        valid: {},
        invalid: {}
      },
      on: {}
    };

    const validate = validations[field];
    if (typeof validate === "function") {
      const isFieldInvalid = (context) => validate(context.values);
      const setFieldError = assign({
        errors: (context) => ({
          ...context.errors,
          [field]: validate(context.values)
        })
      });

      fieldState.on.SUBMIT = {
        target: ".invalid",
        cond: isFieldInvalid,
        actions: setFieldError
      };
    }

    const asyncValidate = asyncValidations[field];
    if (typeof asyncValidate === "function") {
      const isAsyncFieldInvalid = (context, event) => {
        const fieldTouched = event.type === "CHANGE" && field in event.values;
        const fieldValid =
          typeof validate === "function" ? validate(context.values) : true;
        const shouldAsyncValidte = fieldTouched && fieldValid;

        return shouldAsyncValidte
          ? asyncValidate(context.values)
          : Promise.resolve();
      };

      const setAsyncFieldError = assign({
        errors: (context, event) => ({
          ...context.errors,
          [field]: event.data
        })
      });

      fieldState.states.valid = {
        invoke: {
          id: `validate-${field}`,
          src: isAsyncFieldInvalid,
          onError: {
            target: "invalid",
            actions: setAsyncFieldError
          }
        }
      };
    }

    draftStates[field] = fieldState;
  });

  return createMachine(
    {
      id: "xstate-form",
      initial: "draft",
      context: {
        values: initialValues,
        errors: {}
      },
      states: {
        draft: {
          type: "parallel",
          states: draftStates,
          on: {
            SUBMIT: { target: "loading" },
            CHANGE: { target: "draft", actions: "onChange" }
          }
        },
        loading: {
          invoke: {
            id: "submit-form",
            src: "submit",
            onDone: { target: "success" },
            onError: { target: "error", actions: "setErrors" }
          }
        },
        error: {
          on: {
            SUBMIT: { target: "loading" },
            CHANGE: { target: "draft", actions: "onChange" }
          }
        },
        success: { type: "final" }
      }
    },
    {
      actions: {
        onChange: assign({
          values: (context, event) => ({ ...context.values, ...event.values }),
          errors: (context, event) =>
            omit(context.errors, [
              "non_field_errors",
              ...Object.keys(event.values)
            ])
        }),
        setErrors: assign({
          errors: (context, event) => ({
            ...context.errors,
            ...event.data
          })
        })
      },
      services: {
        submit: (context) => onSubmit(context.values)
      }
    }
  );
};

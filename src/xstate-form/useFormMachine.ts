import * as React from "react";
import { useMachine } from "@xstate/react";

export type FormMachineBag<T extends {}> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  handleSubmit: (event: React.FormEvent) => void;
  handleChange: (event: React.FormEvent) => void;
  isLoading: boolean;
  hasSubmittingError: boolean;
  isSubmitted: boolean;
};

export const useFormMachine = <T extends {}>(
  formMachine
): FormMachineBag<T> => {
  const [current, send] = useMachine(formMachine);
  const { values, errors } = current.context;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send({ type: "SUBMIT" });
  };

  const handleChange = (e: React.FormEvent) => {
    send({ type: "CHANGE", values: { [e.target.name]: e.target.value } });
  };

  return {
    values,
    errors,
    handleSubmit,
    handleChange,
    isLoading: current.matches("loading"),
    hasSubmittingError: current.matches("error"),
    isSubmitted: current.matches("success")
  };
};

import type { Metadata } from "next";
import { RegistrationFlow } from "./RegistrationFlow";

export const metadata: Metadata = {
  title: "Join / Register",
  description:
    "Apply for VAACA membership — choose your accession class, submit your details and register your interest ahead of the Charter's ratification.",
};

export default function RegisterPage() {
  return <RegistrationFlow />;
}

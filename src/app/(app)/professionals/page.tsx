import type { Metadata } from "next";
import { ProfessionalsWorkspace } from "@/components/workbench/ProfessionalsWorkspace";
import { getProfessionals } from "@/lib/data";

export const metadata: Metadata = {
  title: "Find a Professional",
};

export default async function ProfessionalsPage() {
  const professionals = await getProfessionals();
  return <ProfessionalsWorkspace professionals={professionals} />;
}

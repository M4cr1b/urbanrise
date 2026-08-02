import type { Metadata } from "next";
import { GreenHubWorkspace } from "@/components/workbench/GreenHubWorkspace";
import { getMaterials } from "@/lib/data";

export const metadata: Metadata = {
  title: "Green Building Hub",
};

export default async function GreenHubPage() {
  const materials = await getMaterials();
  return <GreenHubWorkspace materials={materials} />;
}

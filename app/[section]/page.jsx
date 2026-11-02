import { notFound } from "next/navigation";
import { routes } from "../../lib/model.mjs";
import Screens from "../../components/Screens";
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(routes).map((section) => ({ section }));
}
export async function generateMetadata({ params }) {
  const { section } = await params;
  return { title: routes[section] || "Member workspace" };
}
export default async function Section({ params }) {
  const { section } = await params;
  if (!routes[section]) notFound();
  return <Screens view={section} />;
}

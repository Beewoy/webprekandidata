import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/env";

export default function Home() {
  redirect(isDemoMode() ? "/app/web/demo" : "/app");
}

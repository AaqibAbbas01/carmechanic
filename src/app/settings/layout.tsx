import { AppProvider } from "@/context/app-context"
import { SettingsShell } from "@/components/settings-shell"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <SettingsShell>{children}</SettingsShell>
    </AppProvider>
  )
}


import { User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"

export const AppHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <SidebarTrigger className="md:hidden mr-2" />
        <div className="mr-4 hidden md:flex">
          {/* Logo placeholder */}
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
            CB
          </div>
        </div>
        <h1 className="font-semibold text-sm md:text-lg">
          SysProm - Sistema de Promoções do CBMEPI
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-medium">Administrador</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </div>
          <Avatar>
            <AvatarImage src="" alt="Avatar do usuário" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}

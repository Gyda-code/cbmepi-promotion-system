
import { Book, ChevronDown, FileText } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export const AppSidebar = () => {
  const [openSections, setOpenSections] = useState({
    oficiais: false,
    pracas: false,
    legislacao: false,
  })

  const toggleSection = (section: 'oficiais' | 'pracas' | 'legislacao') => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <Sidebar>
      <SidebarHeader className="px-2">
        <div className="flex md:hidden items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
            CB
          </div>
          <span className="font-medium">SysProm CBMEPI</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* OFICIAIS */}
          <SidebarMenuItem>
            <Collapsible 
              open={openSections.oficiais} 
              onOpenChange={() => toggleSection('oficiais')}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full justify-between">
                  <div className="flex items-center">
                    <Book className="mr-2 h-4 w-4" />
                    <span>OFICIAIS</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.oficiais ? 'rotate-180' : ''}`} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/oficiais/qoem">QOEM - Estado-Maior</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/oficiais/qoe">QOE - Especialistas</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/oficiais/qorr">QORR - Reserva Remunerada</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/oficiais/qfv">QFV - Fixação de Vagas</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/oficiais/qaa">QAA - Antiguidade</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/oficiais/qfm">QFM - Merecimento</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          {/* PRAÇAS */}
          <SidebarMenuItem>
            <Collapsible 
              open={openSections.pracas} 
              onOpenChange={() => toggleSection('pracas')}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full justify-between">
                  <div className="flex items-center">
                    <Book className="mr-2 h-4 w-4" />
                    <span>PRAÇAS</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.pracas ? 'rotate-180' : ''}`} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/pracas/qpbm">QPBM - ATIVOS</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/pracas/qprr">QPRR - Reserva Remunerada</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/pracas/qfv">QFV - Fixação de Vagas</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/pracas/qaa">QAA - Antiguidade</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/pracas/qfm">QFM - Merecimento</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          {/* LEGISLAÇÃO */}
          <SidebarMenuItem>
            <Collapsible 
              open={openSections.legislacao} 
              onOpenChange={() => toggleSection('legislacao')}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>LEGISLAÇÃO</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.legislacao ? 'rotate-180' : ''}`} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to="/legislacao/lei-7772">Lei 7.772 DE 04/04/2022</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

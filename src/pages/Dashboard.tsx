
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Dashboard = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Sistema de Promoções CBMEPI</h1>
      <p className="text-muted-foreground">Bem-vindo ao sistema de gerenciamento de promoções do Corpo de Bombeiros Militar do Estado do Piauí.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Oficiais</CardTitle>
            <CardDescription>Gerenciamento de promoções de oficiais</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Acesse o menu lateral para gerenciar quadros de oficiais.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Praças</CardTitle>
            <CardDescription>Gerenciamento de promoções de praças</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Acesse o menu lateral para gerenciar quadros de praças.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Legislação</CardTitle>
            <CardDescription>Base legal para promoções</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Consulte a legislação vigente sobre promoções.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard


import { AppLayout } from "@/components/Layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const NotFound = () => {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-2xl font-medium mb-4">Página não encontrada</h2>
        <p className="text-muted-foreground mb-6">
          A página que você está tentando acessar não foi encontrada.
        </p>
        <Button asChild>
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    </AppLayout>
  )
}

export default NotFound

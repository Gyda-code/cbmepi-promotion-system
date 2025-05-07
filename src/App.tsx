
import React from 'react'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Index from "./pages/Index"
import NotFound from "./pages/NotFound"
import Lei7772 from "./pages/legislacao/Lei7772"
import PlaceholderOficiais from "./pages/oficiais/PlaceholderOficiais"
import PlaceholderPracas from "./pages/pracas/PlaceholderPracas"

const queryClient = new QueryClient()

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Rotas de Oficiais */}
            <Route path="/oficiais/qoem" element={<PlaceholderOficiais />} />
            <Route path="/oficiais/qoe" element={<PlaceholderOficiais />} />
            <Route path="/oficiais/qorr" element={<PlaceholderOficiais />} />
            <Route path="/oficiais/qfv" element={<PlaceholderOficiais />} />
            <Route path="/oficiais/qaa" element={<PlaceholderOficiais />} />
            <Route path="/oficiais/qfm" element={<PlaceholderOficiais />} />
            
            {/* Rotas de Praças */}
            <Route path="/pracas/qpbm" element={<PlaceholderPracas />} />
            <Route path="/pracas/qprr" element={<PlaceholderPracas />} />
            <Route path="/pracas/qfv" element={<PlaceholderPracas />} />
            <Route path="/pracas/qaa" element={<PlaceholderPracas />} />
            <Route path="/pracas/qfm" element={<PlaceholderPracas />} />
            
            {/* Rota de Legislação */}
            <Route path="/legislacao/lei-7772" element={<Lei7772 />} />
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
)

export default App

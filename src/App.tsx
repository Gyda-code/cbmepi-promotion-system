
import React from 'react'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Index from "./pages/Index"
import NotFound from "./pages/NotFound"
import Lei7772 from "./pages/legislacao/Lei7772"

// Military pages
import MilitaryListPage from "./pages/military/MilitaryListPage"
import MilitaryFormPage from "./pages/military/MilitaryFormPage"
import ConceptSheetPage from "./pages/military/ConceptSheetPage"
import PromotionsHistoryPage from "./pages/military/PromotionsHistoryPage"

// Promotion pages
import QAAPage from "./pages/promotion/QAAPage"
import QAMPage from "./pages/promotion/QAMPage"
import VacancyQuotaPage from "./pages/promotion/VacancyQuotaPage"

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
            <Route path="/oficiais/:divisionCode" element={<MilitaryListPage />} />
            
            {/* Rotas de Praças */}
            <Route path="/pracas/:divisionCode" element={<MilitaryListPage />} />
            
            {/* Rotas para Militares */}
            <Route path="/military/new/:divisionId" element={<MilitaryFormPage />} />
            <Route path="/military/edit/:id" element={<MilitaryFormPage />} />
            <Route path="/military/concept-sheet/:id" element={<ConceptSheetPage />} />
            <Route path="/military/promotions/:id" element={<PromotionsHistoryPage />} />
            
            {/* Rotas de Promoção */}
            <Route path="/promocao/qaa/:divisionCode" element={<QAAPage />} />
            <Route path="/promocao/qam/:divisionCode" element={<QAMPage />} />
            <Route path="/promocao/qfv" element={<VacancyQuotaPage />} />
            
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

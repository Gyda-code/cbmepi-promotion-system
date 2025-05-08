
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/Layout/AppLayout";
import PlaceholderOficiais from "./PlaceholderOficiais";

const OficiaisLayout = () => {
  const location = useLocation();
  const [currentQuadro, setCurrentQuadro] = useState("");
  
  useEffect(() => {
    // Extract the current quadro from the URL path
    const path = location.pathname;
    const quadro = path.split('/').pop() || '';
    setCurrentQuadro(quadro.toUpperCase());
  }, [location]);

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Quadro de Oficiais - {currentQuadro}</h1>
        <PlaceholderOficiais quadro={currentQuadro} />
      </div>
    </AppLayout>
  );
};

export default OficiaisLayout;

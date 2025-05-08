
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/Layout/AppLayout";
import PlaceholderPracas from "./PlaceholderPracas";

const PracasLayout = () => {
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
        <h1 className="text-2xl font-bold">Quadro de Praças - {currentQuadro}</h1>
        <PlaceholderPracas quadro={currentQuadro} />
      </div>
    </AppLayout>
  );
};

export default PracasLayout;

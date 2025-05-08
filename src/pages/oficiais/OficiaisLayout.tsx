
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
      <div>
        <h1 className="text-2xl font-bold mb-4">Quadro de Oficiais - {currentQuadro}</h1>
        <PlaceholderOficiais />
      </div>
    </AppLayout>
  );
};

export default OficiaisLayout;

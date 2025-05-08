
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/Layout/AppLayout";
import MilitaryList from "@/components/military/MilitaryList";

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
      <MilitaryList divisionCode={currentQuadro} />
    </AppLayout>
  );
};

export default PracasLayout;

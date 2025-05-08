
import React from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/Layout/AppLayout";
import Lei7772 from "./Lei7772";

const LegislacaoLayout = () => {
  const location = useLocation();
  
  // Determine which legislation to show based on the path
  const renderContent = () => {
    if (location.pathname.includes('lei-7772')) {
      return <Lei7772 />;
    }
    return null;
  };

  return (
    <AppLayout>
      {renderContent()}
    </AppLayout>
  );
};

export default LegislacaoLayout;

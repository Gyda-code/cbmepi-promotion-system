
import React from "react";
import { useLocation } from "react-router-dom";

const PlaceholderPracas = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const section = pathParts[pathParts.length - 1].toUpperCase();
  
  let title = "Seção não encontrada";
  
  switch(section) {
    case 'QPBM':
      title = "QPBM - Quadro de Praças Bombeiros Militares Ativos";
      break;
    case 'QPRR':
      title = "QPRR - Quadro de Praças da Reserva Remunerada";
      break;
    case 'QFV':
      title = "QFV - Quadro de Fixação de Vagas";
      break;
    case 'QAA':
      title = "QAA - Quadro de Acesso por Antiguidade";
      break;
    case 'QFM':
      title = "QFM - Quadro de Acesso por Merecimento";
      break;
    default:
      title = "Praças - " + section;
  }
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">
        Esta é a página de gerenciamento para {title}.
      </p>
      <div className="border rounded-md p-4 bg-muted/20">
        <h2 className="text-lg font-medium mb-2">Conteúdo em desenvolvimento</h2>
        <p>Esta seção está sendo implementada. Em breve, conteúdo específico para {title} estará disponível aqui.</p>
      </div>
    </div>
  );
};

export default PlaceholderPracas;

import { useState } from "react";
import { Layout } from "./components/Layout";
import { DiscoveryView } from "./components/DiscoveryView";
import { PropertyDetailView } from "./components/PropertyDetailView";
import { PropertyUploadWizard } from "./components/PropertyUploadWizard";
import { VisitManagementView } from "./components/VisitManagementView";
import { NegotiationPanelView } from "./components/NegotiationPanelView";
import { FinancialAnalysisView } from "./components/FinancialAnalysisView";
import { Toaster } from "./components/ui/sonner";

type View = "discover" | "negotiations" | "favorites" | "documents" | "my-properties";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("discover");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [userType] = useState<"visitor" | "registered" | "verified" | "premium" | "admin">("verified");

  const handlePropertyClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setCurrentView("discover"); // Will show property detail in discovery view
  };

  const handleBackToDiscovery = () => {
    setCurrentView("discover");
    setSelectedPropertyId(null);
  };

  const handleUploadComplete = () => {
    setCurrentView("my-properties");
  };

  const handleUploadCancel = () => {
    setCurrentView("discover");
  };

  const handleUploadProperty = () => {
    setCurrentView("upload");
  };

  const renderView = () => {
    switch (currentView) {
      case "discover":
        return <DiscoveryView />;
      case "negotiations":
        return <NegotiationPanelView />;
      case "favorites":
        return (
          <div className="min-h-screen bg-muted/30 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Mis Favoritos</h2>
              <p className="text-muted-foreground">Aquí aparecerán las propiedades que hayas marcado como favoritas</p>
            </div>
          </div>
        );
      case "documents":
        return (
          <div className="min-h-screen bg-muted/30 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Mis Documentos</h2>
              <p className="text-muted-foreground">Gestiona tus contratos y documentos legales</p>
            </div>
          </div>
        );
      case "my-properties":
        return (
          <div className="min-h-screen bg-muted/30">
            <div className="bg-white border-b border-border px-4 py-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold">Mis Propiedades</h1>
                  <p className="text-muted-foreground">Gestiona las propiedades que has publicado</p>
                </div>
                <button
                  onClick={() => setCurrentView("discover")}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Publicar Nueva Propiedad
                </button>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-6 lg:px-6">
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-4">Tus Propiedades</h2>
                <p className="text-muted-foreground mb-6">Aquí aparecerán las propiedades que hayas publicado</p>
                <button
                  onClick={() => setCurrentView("discover")}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Publicar Primera Propiedad
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <DiscoveryView />;
    }
  };

  // Show upload wizard when needed
  if (currentView === "upload") {
    return (
      <PropertyUploadWizard 
        onComplete={handleUploadComplete}
        onCancel={handleUploadCancel}
      />
    );
  }

  return (
    <Layout currentView={currentView} userType={userType} onUploadProperty={handleUploadProperty}>
      {renderView()}
      <Toaster />
    </Layout>
  );
}

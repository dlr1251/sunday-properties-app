import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Eye, TrendingUp, DollarSign, FileText, BarChart3 } from "lucide-react";

interface Deal {
  id: string;
  propertyTitle: string;
  buyerName: string;
  offerAmount: string;
  counterOfferAmount?: string;
  status: "negotiating" | "counter-offer" | "pending-signature" | "signed";
  lastActivity: string;
  documents: string[];
  roi?: string;
  downPayment?: string;
  loanTerm?: string;
  monthlyPayment?: string;
}

const mockDeals: Deal[] = [
  {
    id: "1",
    propertyTitle: "Finca en El Retiro",
    buyerName: "Juan Pérez",
    offerAmount: "$650,000,000 COP",
    counterOfferAmount: "$680,000,000 COP",
    status: "counter-offer",
    lastActivity: "Hace 2 horas",
    documents: ["Oferta inicial", "Contraoferta"],
    roi: "8.5%",
    downPayment: "30%",
    loanTerm: "15 años",
    monthlyPayment: "$4,200,000 COP",
  },
  {
    id: "2",
    propertyTitle: "Apartamento en Envigado",
    buyerName: "María García",
    offerAmount: "$450,000,000 COP",
    status: "pending-signature",
    lastActivity: "Hace 1 día",
    documents: ["Oferta aceptada", "Contrato de compraventa", "Certificado de tradición"],
    roi: "6.2%",
    downPayment: "20%",
    loanTerm: "20 años",
    monthlyPayment: "$2,800,000 COP",
  },
  {
    id: "3",
    propertyTitle: "Penthouse El Poblado",
    buyerName: "Carlos Rodríguez",
    offerAmount: "$1,150,000,000 COP",
    status: "negotiating",
    lastActivity: "Hace 3 horas",
    documents: ["Oferta inicial", "Estados financieros"],
    roi: "7.8%",
    downPayment: "40%",
    loanTerm: "10 años",
    monthlyPayment: "$7,500,000 COP",
  },
  {
    id: "4",
    propertyTitle: "Casa Campestre Guarne",
    buyerName: "Ana López",
    offerAmount: "$950,000,000 COP",
    status: "signed",
    lastActivity: "Hace 5 días",
    documents: ["Contrato firmado", "Escritura pública", "Paz y salvo"],
    roi: "9.1%",
    downPayment: "35%",
    loanTerm: "12 años",
    monthlyPayment: "$5,800,000 COP",
  },
  {
    id: "5",
    propertyTitle: "Casa Colonial La Ceja",
    buyerName: "Roberto Martínez",
    offerAmount: "$520,000,000 COP",
    counterOfferAmount: "$545,000,000 COP",
    status: "counter-offer",
    lastActivity: "Hace 4 horas",
    documents: ["Oferta inicial", "Contraoferta", "Avalúo"],
    roi: "5.9%",
    downPayment: "25%",
    loanTerm: "18 años",
    monthlyPayment: "$3,400,000 COP",
  },
];

const statusConfig = {
  "negotiating": { label: "Negociando", color: "bg-blue-500" },
  "counter-offer": { label: "Contraoferta", color: "bg-orange-500" },
  "pending-signature": { label: "Pendiente Firma", color: "bg-yellow-500" },
  "signed": { label: "Firmado", color: "bg-green-500" },
};

export function DealsView() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedDealsForCompare, setSelectedDealsForCompare] = useState<string[]>([]);

  const handleViewDeal = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  const toggleCompare = (dealId: string) => {
    setSelectedDealsForCompare(prev => {
      if (prev.includes(dealId)) {
        return prev.filter(id => id !== dealId);
      } else if (prev.length < 3) {
        return [...prev, dealId];
      }
      return prev;
    });
  };

  const getDealsToCompare = () => {
    return mockDeals.filter(deal => selectedDealsForCompare.includes(deal.id));
  };

  // Calculate summary metrics
  const totalDeals = mockDeals.length;
  const activeDeals = mockDeals.filter(d => d.status !== "signed").length;
  const totalValue = mockDeals.reduce((sum, deal) => {
    const value = parseInt(deal.offerAmount.replace(/\D/g, ""));
    return sum + value;
  }, 0);
  const avgROI = mockDeals.reduce((sum, deal) => {
    const roi = parseFloat(deal.roi?.replace("%", "") || "0");
    return sum + roi;
  }, 0) / mockDeals.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-['Inter:Black',_sans-serif] font-black text-[20px] text-black">
          Mis Negocios
        </h2>
        <Button
          variant={compareMode ? "default" : "outline"}
          onClick={() => {
            setCompareMode(!compareMode);
            setSelectedDealsForCompare([]);
          }}
          className={compareMode ? "bg-[#ff9b4e] text-black hover:bg-[#ff8a35]" : ""}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          {compareMode ? "Salir de Comparar" : "Comparar Ofertas"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Negocios</p>
                <p className="font-['Inter:Black',_sans-serif] font-black text-[24px]">
                  {totalDeals}
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="font-['Inter:Black',_sans-serif] font-black text-[24px]">
                  {activeDeals}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="font-['Inter:Black',_sans-serif] font-black text-[20px]">
                  ${(totalValue / 1000000000).toFixed(1)}B
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROI Promedio</p>
                <p className="font-['Inter:Black',_sans-serif] font-black text-[24px] text-[#2dc97b]">
                  {avgROI.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-[#2dc97b]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison View */}
      {compareMode && selectedDealsForCompare.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparación de Ofertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Métrica</th>
                    {getDealsToCompare().map(deal => (
                      <th key={deal.id} className="text-left py-3 px-4">
                        {deal.propertyTitle}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-bold">Oferta</td>
                    {getDealsToCompare().map(deal => (
                      <td key={deal.id} className="py-3 px-4">{deal.offerAmount}</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-bold">ROI</td>
                    {getDealsToCompare().map(deal => (
                      <td key={deal.id} className="py-3 px-4 text-[#2dc97b]">{deal.roi}</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-bold">Inicial</td>
                    {getDealsToCompare().map(deal => (
                      <td key={deal.id} className="py-3 px-4">{deal.downPayment}</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-bold">Plazo</td>
                    {getDealsToCompare().map(deal => (
                      <td key={deal.id} className="py-3 px-4">{deal.loanTerm}</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-bold">Cuota Mensual</td>
                    {getDealsToCompare().map(deal => (
                      <td key={deal.id} className="py-3 px-4">{deal.monthlyPayment}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Estado</td>
                    {getDealsToCompare().map(deal => (
                      <td key={deal.id} className="py-3 px-4">
                        <Badge className={`${statusConfig[deal.status].color} text-white`}>
                          {statusConfig[deal.status].label}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los Negocios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {compareMode && <TableHead className="w-12"></TableHead>}
                <TableHead>Propiedad</TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead>Oferta</TableHead>
                <TableHead>Contraoferta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDeals.map((deal) => (
                <TableRow key={deal.id}>
                  {compareMode && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedDealsForCompare.includes(deal.id)}
                        onChange={() => toggleCompare(deal.id)}
                        disabled={!selectedDealsForCompare.includes(deal.id) && selectedDealsForCompare.length >= 3}
                        className="w-4 h-4"
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-bold">{deal.propertyTitle}</TableCell>
                  <TableCell>{deal.buyerName}</TableCell>
                  <TableCell>{deal.offerAmount}</TableCell>
                  <TableCell>{deal.counterOfferAmount || "-"}</TableCell>
                  <TableCell>
                    <Badge className={`${statusConfig[deal.status].color} text-white`}>
                      {statusConfig[deal.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#2dc97b]">{deal.roi}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{deal.lastActivity}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDeal(deal)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Deal Detail Dialog */}
      <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDeal?.propertyTitle}</DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="financials">Financieros</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Comprador</p>
                      <p className="font-bold">{selectedDeal.buyerName}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <Badge className={`${statusConfig[selectedDeal.status].color} text-white mt-2`}>
                        {statusConfig[selectedDeal.status].label}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Oferta Inicial</p>
                      <p className="font-bold">{selectedDeal.offerAmount}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Contraoferta</p>
                      <p className="font-bold">{selectedDeal.counterOfferAmount || "N/A"}</p>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">Última Actividad</p>
                    <p>{selectedDeal.lastActivity}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financials" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">ROI Estimado</p>
                      <p className="font-['Inter:Black',_sans-serif] font-black text-[24px] text-[#2dc97b]">
                        {selectedDeal.roi}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Inicial</p>
                      <p className="font-['Inter:Black',_sans-serif] font-black text-[24px]">
                        {selectedDeal.downPayment}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Plazo del Préstamo</p>
                      <p className="font-bold">{selectedDeal.loanTerm}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Cuota Mensual</p>
                      <p className="font-bold">{selectedDeal.monthlyPayment}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="space-y-2">
                  {selectedDeal.documents.map((doc, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <span>{doc}</span>
                          </div>
                          <Button variant="outline" size="sm">
                            Ver
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

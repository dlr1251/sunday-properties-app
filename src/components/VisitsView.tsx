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
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Check,
  X,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Visit {
  id: string;
  propertyTitle: string;
  propertyLocation: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  type: "incoming" | "scheduled"; // incoming = visits to my properties, scheduled = visits I booked
}

const mockVisits: Visit[] = [
  {
    id: "1",
    propertyTitle: "Finca en El Retiro",
    propertyLocation: "Llanogrande, Rionegro",
    clientName: "Carlos Ramírez",
    clientPhone: "+57 300 111 2233",
    clientEmail: "carlos.r@email.com",
    date: "2024-10-25",
    time: "10:00 AM",
    status: "pending",
    notes: "Interesado en compra para inversión",
    type: "incoming",
  },
  {
    id: "2",
    propertyTitle: "Apartamento en Envigado",
    propertyLocation: "Zona Rosa, Envigado",
    clientName: "Ana Gómez",
    clientPhone: "+57 301 222 3344",
    clientEmail: "ana.g@email.com",
    date: "2024-10-26",
    time: "02:00 PM",
    status: "confirmed",
    notes: "Primera vivienda",
    type: "incoming",
  },
  {
    id: "3",
    propertyTitle: "Penthouse El Poblado",
    propertyLocation: "Manila, El Poblado",
    clientName: "Jorge Pérez",
    clientPhone: "+57 302 333 4455",
    clientEmail: "jorge.p@email.com",
    date: "2024-10-24",
    time: "11:00 AM",
    status: "completed",
    notes: "Visita exitosa, le gustó mucho",
    type: "incoming",
  },
  {
    id: "4",
    propertyTitle: "Casa Colonial La Ceja",
    propertyLocation: "Centro, La Ceja",
    clientName: "María García",
    clientPhone: "+57 303 444 5566",
    clientEmail: "maria.g@email.com",
    date: "2024-10-27",
    time: "03:00 PM",
    status: "pending",
    type: "scheduled",
  },
  {
    id: "5",
    propertyTitle: "Casa Campestre Guarne",
    propertyLocation: "Vereda San Ignacio, Guarne",
    clientName: "Roberto Silva",
    clientPhone: "+57 304 555 6677",
    clientEmail: "roberto.s@email.com",
    date: "2024-10-23",
    time: "09:00 AM",
    status: "cancelled",
    notes: "Cliente canceló por motivos personales",
    type: "incoming",
  },
];

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-500" },
  confirmed: { label: "Confirmada", color: "bg-blue-500" },
  completed: { label: "Completada", color: "bg-green-500" },
  cancelled: { label: "Cancelada", color: "bg-red-500" },
};

export function VisitsView() {
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "incoming" | "scheduled">("all");

  const handleConfirmVisit = (visitId: string) => {
    toast.success("Visita confirmada");
  };

  const handleCancelVisit = (visitId: string) => {
    toast.error("Visita cancelada");
  };

  const handleCompleteVisit = (visitId: string) => {
    toast.success("Visita marcada como completada");
  };

  const filteredVisits = mockVisits.filter((visit) => {
    if (activeTab === "all") return true;
    return visit.type === activeTab;
  });

  const stats = {
    total: mockVisits.length,
    pending: mockVisits.filter((v) => v.status === "pending").length,
    confirmed: mockVisits.filter((v) => v.status === "confirmed").length,
    completed: mockVisits.filter((v) => v.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <h2 className="font-['Inter:Black',_sans-serif] font-black text-[20px] text-black">
        Mis Visitas
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Visitas</p>
                <p className="font-['Inter:Black',_sans-serif] font-black text-[24px]">
                  {stats.total}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="font-['Inter:Black',_sans-serif] font-black text-[24px] text-yellow-500">
                  {stats.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmadas</p>
                <p className="font-['Inter:Black',_sans-serif] font-black text-[24px] text-blue-500">
                  {stats.confirmed}
                </p>
              </div>
              <Check className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="font-['Inter:Black',_sans-serif] font-black text-[24px] text-green-500">
                  {stats.completed}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="incoming">Visitas a mis propiedades</TabsTrigger>
          <TabsTrigger value="scheduled">Visitas agendadas por mí</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Visitas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Propiedad</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>
                        <div>
                          <p className="font-bold">{visit.propertyTitle}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {visit.propertyLocation}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{visit.clientName}</p>
                          <p className="text-sm text-muted-foreground">{visit.clientPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(visit.date).toLocaleDateString('es-CO')}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {visit.time}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig[visit.status].color} text-white`}>
                          {statusConfig[visit.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {visit.type === "incoming" ? "Entrante" : "Agendada"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedVisit(visit)}
                          >
                            Ver
                          </Button>
                          {visit.status === "pending" && visit.type === "incoming" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleConfirmVisit(visit.id)}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelVisit(visit.id)}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          {visit.status === "confirmed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCompleteVisit(visit.id)}
                            >
                              Completar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Visit Detail Dialog */}
      <Dialog open={!!selectedVisit} onOpenChange={() => setSelectedVisit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Visita</DialogTitle>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-4 py-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Propiedad</p>
                    <p className="font-bold">{selectedVisit.propertyTitle}</p>
                    <p className="text-sm flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {selectedVisit.propertyLocation}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Fecha
                      </p>
                      <p>{new Date(selectedVisit.date).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Hora
                      </p>
                      <p>{selectedVisit.time}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge className={`${statusConfig[selectedVisit.status].color} text-white mt-1`}>
                      {statusConfig[selectedVisit.status].label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-3">
                  <h4 className="font-bold">Información del Cliente</h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedVisit.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedVisit.clientPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedVisit.clientEmail}</span>
                    </div>
                  </div>

                  {selectedVisit.notes && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                        <MessageSquare className="h-4 w-4" />
                        Notas
                      </p>
                      <p className="text-sm">{selectedVisit.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            {selectedVisit?.status === "pending" && selectedVisit.type === "incoming" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleCancelVisit(selectedVisit.id);
                    setSelectedVisit(null);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar Visita
                </Button>
                <Button
                  className="bg-[#2dc97b] text-[#150f0f] hover:bg-[#26b36b]"
                  onClick={() => {
                    handleConfirmVisit(selectedVisit.id);
                    setSelectedVisit(null);
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar Visita
                </Button>
              </>
            )}
            {selectedVisit?.status === "confirmed" && (
              <Button
                className="bg-[#2dc97b] text-[#150f0f] hover:bg-[#26b36b]"
                onClick={() => {
                  handleCompleteVisit(selectedVisit.id);
                  setSelectedVisit(null);
                }}
              >
                Marcar como Completada
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

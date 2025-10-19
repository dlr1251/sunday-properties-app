import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";
import {
  Pencil,
  Save,
  X,
  Upload,
  Star,
  TrendingUp,
  Home,
  DollarSign,
  Award,
  Globe,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Shield,
  Bell,
  Lock,
  Eye,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ProfileData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  bio: string;
  
  // Professional Information
  role: string;
  licenseNumber: string;
  yearsExperience: string;
  specializations: string[];
  languages: string[];
  
  // Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  profileVisibility: string;
  
  // Photo
  avatarUrl: string;
}

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  propertyTitle: string;
}

const initialProfileData: ProfileData = {
  firstName: "María",
  lastName: "García Pérez",
  email: "maria.garcia@example.com",
  phone: "+57 301 234 5678",
  dateOfBirth: "1985-05-15",
  address: "Calle 10 # 43-25",
  city: "Medellín",
  country: "Colombia",
  bio: "Agente inmobiliaria con más de 8 años de experiencia en el mercado de propiedades de lujo en Antioquia. Especializada en fincas y propiedades campestres.",
  role: "Senior Real Estate Agent",
  licenseNumber: "LIC-COL-2016-8734",
  yearsExperience: "8",
  specializations: ["Fincas", "Propiedades de Lujo", "Inversión"],
  languages: ["Español", "Inglés", "Portugués"],
  emailNotifications: true,
  smsNotifications: false,
  profileVisibility: "public",
  avatarUrl: "https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MDkwNDIzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
};

const mockReviews: Review[] = [
  {
    id: "1",
    clientName: "Carlos Rodríguez",
    rating: 5,
    comment: "Excelente profesional, me ayudó a encontrar la finca perfecta para mi familia. Muy atenta y conocedora del mercado.",
    date: "2024-09-15",
    propertyTitle: "Finca en El Retiro",
  },
  {
    id: "2",
    clientName: "Ana López",
    rating: 5,
    comment: "María fue fundamental en la venta de mi propiedad. Proceso rápido y sin complicaciones. Totalmente recomendada.",
    date: "2024-08-22",
    propertyTitle: "Casa Campestre Guarne",
  },
  {
    id: "3",
    clientName: "Roberto Martínez",
    rating: 4,
    comment: "Muy profesional y dedicada. Siempre disponible para responder mis preguntas. Gran experiencia.",
    date: "2024-07-10",
    propertyTitle: "Apartamento en Envigado",
  },
  {
    id: "4",
    clientName: "Laura Sánchez",
    rating: 5,
    comment: "La mejor agente con la que he trabajado. Conoce perfectamente el mercado de Antioquia.",
    date: "2024-06-05",
    propertyTitle: "Penthouse El Poblado",
  },
];

const achievements = [
  { title: "Top Agent 2023", icon: Award, color: "text-yellow-500" },
  { title: "100+ Propiedades Vendidas", icon: Home, color: "text-blue-500" },
  { title: "Especialista Certificada", icon: Shield, color: "text-green-500" },
  { title: "5 Estrellas Promedio", icon: Star, color: "text-purple-500" },
];

export function ProfileView() {
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProfileData>(initialProfileData);

  const handleEdit = () => {
    setEditedData(profileData);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData(editedData);
    setIsEditing(false);
    toast.success("Perfil actualizado exitosamente");
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  const handlePhotoUpload = () => {
    toast.success("Foto de perfil actualizada");
  };

  const updateField = (field: keyof ProfileData, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const avgRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length;

  const stats = [
    { label: "Propiedades Vendidas", value: "142", icon: Home, color: "bg-blue-500" },
    { label: "Listados Activos", value: "23", icon: TrendingUp, color: "bg-green-500" },
    { label: "Valor Total Negocios", value: "$8.5B COP", icon: DollarSign, color: "bg-yellow-500" },
    { label: "Calificación Promedio", value: avgRating.toFixed(1), icon: Star, color: "bg-purple-500" },
  ];

  const currentData = isEditing ? editedData : profileData;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="font-['Inter:Black',_sans-serif] font-black text-[20px] text-black">
          Mi Perfil
        </h2>
        {!isEditing ? (
          <Button onClick={handleEdit} className="bg-[#ff9b4e] text-black hover:bg-[#ff8a35]">
            <Pencil className="mr-2 h-4 w-4" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#2dc97b] text-[#150f0f] hover:bg-[#26b36b]">
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          </div>
        )}
      </div>

      {/* Header Card with Photo and Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={currentData.avatarUrl} alt={`${currentData.firstName} ${currentData.lastName}`} />
                <AvatarFallback className="text-[32px]">
                  {currentData.firstName[0]}{currentData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="outline" size="sm" onClick={handlePhotoUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Cambiar Foto
                </Button>
              )}
              <div className="text-center">
                <p className="font-['Inter:Black',_sans-serif] font-black text-[18px]">
                  {currentData.firstName} {currentData.lastName}
                </p>
                <p className="text-muted-foreground text-sm">{currentData.role}</p>
                <Badge className="mt-2 bg-[#2dc97b] text-[#150f0f]">
                  {currentData.yearsExperience} años de experiencia
                </Badge>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className={`${stat.color} p-3 rounded-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="font-['Inter:Black',_sans-serif] font-black text-[20px]">
                              {stat.value}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Achievements */}
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">Logros</p>
                <div className="flex flex-wrap gap-2">
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <Badge key={index} variant="outline" className="gap-2">
                        <Icon className={`h-4 w-4 ${achievement.color}`} />
                        {achievement.title}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Información Personal</TabsTrigger>
          <TabsTrigger value="professional">Profesional</TabsTrigger>
          <TabsTrigger value="reviews">Reseñas ({mockReviews.length})</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={currentData.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <p>{currentData.firstName}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={currentData.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <p>{currentData.lastName}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={currentData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <p>{currentData.email}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Teléfono
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={currentData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <p>{currentData.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Fecha de Nacimiento
                </Label>
                {isEditing ? (
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={currentData.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <p>{new Date(currentData.dateOfBirth).toLocaleDateString('es-CO')}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="address">
                  <MapPin className="inline h-4 w-4 mr-2" />
                  Dirección
                </Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={currentData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <p>{currentData.address}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  {isEditing ? (
                    <Input
                      id="city"
                      value={currentData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <p>{currentData.city}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">
                    <Globe className="inline h-4 w-4 mr-2" />
                    País
                  </Label>
                  {isEditing ? (
                    <Input
                      id="country"
                      value={currentData.country}
                      onChange={(e) => updateField("country", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <p>{currentData.country}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    rows={4}
                    value={currentData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{currentData.bio}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Information Tab */}
        <TabsContent value="professional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Profesional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">
                    <Briefcase className="inline h-4 w-4 mr-2" />
                    Cargo
                  </Label>
                  {isEditing ? (
                    <Input
                      id="role"
                      value={currentData.role}
                      onChange={(e) => updateField("role", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <p>{currentData.role}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">
                    <Shield className="inline h-4 w-4 mr-2" />
                    Licencia Profesional
                  </Label>
                  {isEditing ? (
                    <Input
                      id="licenseNumber"
                      value={currentData.licenseNumber}
                      onChange={(e) => updateField("licenseNumber", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <p>{currentData.licenseNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Años de Experiencia</Label>
                {isEditing ? (
                  <Input
                    id="yearsExperience"
                    type="number"
                    value={currentData.yearsExperience}
                    onChange={(e) => updateField("yearsExperience", e.target.value)}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <p>{currentData.yearsExperience} años</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Especializaciones</Label>
                <div className="flex flex-wrap gap-2">
                  {currentData.specializations.map((spec, index) => (
                    <Badge key={index} className="bg-[#ff9b4e] text-black">
                      {spec}
                    </Badge>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      + Agregar
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  <Globe className="inline h-4 w-4 mr-2" />
                  Idiomas
                </Label>
                <div className="flex flex-wrap gap-2">
                  {currentData.languages.map((lang, index) => (
                    <Badge key={index} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      + Agregar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rendimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Meta Mensual</span>
                  <span>85%</span>
                </div>
                <Progress value={85} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Satisfacción del Cliente</span>
                  <span>96%</span>
                </div>
                <Progress value={96} className="[&>div]:bg-[#2dc97b]" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tasa de Cierre</span>
                  <span>78%</span>
                </div>
                <Progress value={78} className="[&>div]:bg-[#ff9b4e]" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Reseñas de Clientes</span>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  <span className="font-['Inter:Black',_sans-serif] font-black text-[20px]">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({mockReviews.length} reseñas)
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold">{review.clientName}</p>
                          <p className="text-sm text-muted-foreground">{review.propertyTitle}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <Bell className="inline h-5 w-5 mr-2" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe actualizaciones sobre tus propiedades y negocios
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={currentData.emailNotifications}
                  onCheckedChange={(checked) => updateField("emailNotifications", checked)}
                  disabled={!isEditing}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">Notificaciones SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe alertas importantes por mensaje de texto
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={currentData.smsNotifications}
                  onCheckedChange={(checked) => updateField("smsNotifications", checked)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Eye className="inline h-5 w-5 mr-2" />
                Privacidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Visibilidad del Perfil</Label>
                <p className="text-sm text-muted-foreground">
                  Controla quién puede ver tu información de perfil
                </p>
                <div className="flex gap-2">
                  <Badge
                    className={currentData.profileVisibility === "public" ? "bg-[#2dc97b] text-white" : ""}
                    variant={currentData.profileVisibility === "public" ? "default" : "outline"}
                  >
                    Público
                  </Badge>
                  <Badge
                    className={currentData.profileVisibility === "private" ? "bg-[#2dc97b] text-white" : ""}
                    variant={currentData.profileVisibility === "private" ? "default" : "outline"}
                  >
                    Privado
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Lock className="inline h-5 w-5 mr-2" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Cambiar Contraseña
              </Button>
              <Button variant="outline" className="w-full">
                Autenticación de Dos Factores
              </Button>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-bold">Última actividad</p>
                <p className="text-sm text-muted-foreground">
                  Último inicio de sesión: Hoy a las 09:30 AM desde Medellín, Colombia
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

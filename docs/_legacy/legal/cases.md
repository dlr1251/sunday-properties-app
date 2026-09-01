# ⚖️ Guía: Gestión de Casos Legales

Esta guía explica cómo funciona el sistema de casos legales cuando una oferta es aceptada.

## 📋 Visión General

Cuando una oferta es aceptada en Sunday Properties, el sistema automáticamente:

1. ✅ Asigna un abogado disponible
2. ✅ Crea un caso legal
3. ✅ Vincula todas las partes (comprador, vendedor, abogado)
4. ✅ Crea una conversación de chat para el caso
5. ✅ Envía notificaciones a todas las partes

## 🎯 Proceso Automático

### Paso 1: Aceptación de Oferta

#### Cuando el Vendedor Acepta:

1. **El Vendedor Acepta la Oferta**
   - En el panel de negociación
   - O directamente desde la notificación

2. **Sistema Automático Activa**:
   - Trigger en base de datos detecta aceptación
   - Busca abogado disponible automáticamente
   - Crea caso legal con toda la información

### Paso 2: Asignación Automática de Abogado

#### Cómo Funciona:

1. **Algoritmo de Asignación**:
   - Busca abogados disponibles
   - Considera carga de trabajo actual
   - Asigna al abogado con menos casos activos
   - Notifica al abogado asignado

2. **Creación del Caso**:
   - Se crea registro en tabla `cases`
   - Vincula propiedad, comprador, vendedor, abogado
   - Estado inicial: "active"
   - Incluye toda la información de la oferta

3. **Notificaciones Automáticas**:
   - 📧 Email a comprador
   - 📧 Email a vendedor
   - 📧 Email a abogado asignado
   - 🔔 Notificaciones en plataforma

### Paso 3: Creación de Conversación

1. **Chat Automático**:
   - Se crea conversación específica para el caso
   - Todas las partes pueden comunicarse
   - Historial completo de mensajes

2. **Partes Involucradas**:
   - Comprador (buyer)
   - Vendedor (seller)
   - Abogado asignado (lawyer)

## 👨‍⚖️ Para Abogados: Gestión de Casos

### Acceder al Panel de Casos

1. **Dashboard de Abogado**
   - Ve a "Mis Casos" en tu dashboard
   - O directamente a `/dashboard/lawyer`

2. **Ver Casos Asignados**:
   - Casos activos
   - Casos pendientes
   - Casos cerrados

### Información del Caso

#### Pestaña "Overview":

1. **Resumen del Caso**:
   - Información de la propiedad
   - Datos del comprador
   - Datos del vendedor
   - Detalles de la oferta aceptada
   - Estado actual del caso

2. **Estadísticas**:
   - Días transcurridos
   - Documentos generados
   - Progreso estimado

#### Pestaña "Documentos":

1. **Documentos del Caso**:
   - Lista de todos los documentos
   - Estado de cada documento
   - Versiones disponibles

2. **Generar Documentos**:
   - Carta de Intención
   - Promesa de Compraventa
   - Minuta de Escritura Pública
   - Otrosí (modificaciones)

#### Pestaña "Timeline":

1. **Historial Completo**:
   - Fecha de creación del caso
   - Documentos generados
   - Firmas recibidas
   - Eventos importantes

#### Pestaña "Partes":

1. **Información de las Partes**:
   - Datos completos del comprador
   - Datos completos del vendedor
   - Información de contacto
   - Documentos de identidad

#### Pestaña "Chat":

1. **Comunicación**:
   - Chat integrado para el caso
   - Mensajes entre todas las partes
   - Compartir documentos

### Generar Documentos Legales

#### Tipos de Documentos Disponibles:

1. **Carta de Intención**
   - Expresión formal de intención de compra
   - NO es legalmente vinculante
   - Incluye términos básicos del acuerdo

2. **Promesa de Compraventa**
   - Legalmente vinculante
   - Define términos finales
   - Requiere firmas de ambas partes

3. **Minuta de Escritura Pública**
   - Documento para notaría
   - Listo para notarización
   - Cumple con Ley 1579 de 2012

4. **Otrosí**
   - Modificaciones al contrato original
   - Referencia al documento original
   - Mantiene validez de cláusulas no modificadas

#### Proceso de Generación:

1. **Seleccionar Tipo de Documento**
   - Haz clic en "Generar Documento"
   - Selecciona el tipo de documento

2. **Generación con IA**:
   - El sistema usa IA (Grok-4) para generar el documento
   - Sigue normativas legales colombianas
   - Incluye toda la información del caso
   - Formato profesional y legal

3. **Revisión y Edición**:
   - Revisa el documento generado
   - Puedes editar si es necesario
   - Guarda versión del documento

4. **Compartir con Partes**:
   - Comparte en el chat del caso
   - Las partes pueden revisar
   - Solicitar firmas cuando esté listo

### Gestión de Firmas

1. **Enviar para Firma**:
   - Marca documento como "Pendiente de Firma"
   - Las partes recibirán notificación

2. **Seguimiento de Firmas**:
   - Ver quién ha firmado
   - Ver quién falta por firmar
   - Recordatorios automáticos

3. **Firmas Completadas**:
   - Cuando todas las partes han firmado
   - Documento pasa a estado "Firmado"
   - Se genera copia final

### Cerrar Caso

1. **Cuando Proceda**:
   - Todas las firmas completadas
   - Escritura pública registrada
   - Transacción completada

2. **Cerrar Caso**:
   - Cambiar estado a "cerrado"
   - Archivar documentos
   - Generar resumen final

## 👥 Para Compradores y Vendedores

### Ver Mi Caso

1. **Dashboard Personal**:
   - Sección "Mis Casos Activos"
   - Ver estado del caso
   - Documentos pendientes

2. **Información Disponible**:
   - Estado actual del caso
   - Documentos generados
   - Próximos pasos
   - Chat con abogado y otra parte

### Comunicación

1. **Chat del Caso**:
   - Comunicación directa con abogado
   - Comunicación con la otra parte
   - Compartir documentos

2. **Notificaciones**:
   - Nuevos documentos generados
   - Solicitudes de firma
   - Mensajes importantes
   - Actualizaciones de estado

### Firmar Documentos

1. **Recibir Solicitud de Firma**:
   - Notificación cuando hay documento para firmar
   - Acceso al documento
   - Revisar antes de firmar

2. **Proceso de Firma**:
   - Leer documento completo
   - Aceptar términos
   - Firmar digitalmente
   - Confirmar firma

## 📄 Tipos de Documentos Detallados

### Carta de Intención

**Propósito**: Expresión formal de intención de compra

**Características**:
- NO es legalmente vinculante
- Establece intención de comprar
- Incluye términos básicos acordados
- Fecha de cierre estimada

**Cuándo Usar**:
- Primera etapa después de aceptar oferta
- Para formalizar intención antes de documentos vinculantes
- Para establecer cronograma básico

### Promesa de Compraventa

**Propósito**: Contrato legalmente vinculante

**Características**:
- Legalmente vinculante según Código Civil Colombiano
- Define términos finales de venta
- Obligaciones de ambas partes
- Penalidades por incumplimiento
- Requiere notarización para efecto completo

**Cuándo Usar**:
- Después de llegar a acuerdo final
- Antes de escritura pública
- Para establecer compromiso legal

**Contenido Típico**:
- Identificación de partes
- Descripción completa de propiedad
- Precio y condiciones de pago
- Fecha de cierre
- Obligaciones de comprador y vendedor
- Penalidades
- Resolución de conflictos

### Minuta de Escritura Pública

**Propósito**: Documento para notaría

**Características**:
- Cumple con Ley 1579 de 2012 (Ley Notarial)
- Listo para presentar en notaría
- Incluye toda la información necesaria
- Formato estándar notarial

**Cuándo Usar**:
- Cuando todo está listo para escrituración
- Antes de ir a notaría
- Para acelerar proceso notarial

**Contenido**:
- Identificación completa de partes
- Descripción registral de propiedad
- Precio y forma de pago documentada
- Declaraciones fiscales
- Transferencia de dominio

### Otrosí

**Propósito**: Modificar contrato existente

**Características**:
- Referencia al contrato original
- Especifica modificaciones exactas
- Mantiene validez de cláusulas no modificadas
- Requiere firmas de ambas partes

**Cuándo Usar**:
- Para modificar términos acordados
- Agregar condiciones adicionales
- Aclarar términos específicos

## 💡 Mejores Prácticas

### Para Abogados:

- ✅ Revisa casos regularmente
- ✅ Genera documentos en orden lógico
- ✅ Comunícate proactivamente con partes
- ✅ Mantén documentos actualizados
- ✅ Explica procesos a clientes

### Para Compradores/Vendedores:

- ✅ Responde rápido a solicitudes
- ✅ Revisa documentos cuidadosamente
- ✅ Pregunta si algo no está claro
- ✅ Mantén comunicación activa
- ✅ Cumple con plazos establecidos

## ❓ Problemas Comunes

### No se asignó abogado automáticamente

- **Solución**: Contacta soporte técnico
- Verifica que haya abogados disponibles
- Puede asignarse manualmente

### El documento generado tiene errores

- **Solución**: Edita el documento antes de compartir
- Verifica información del caso
- Regenera si es necesario

### No recibo notificaciones del caso

- **Solución**: Verifica configuración de notificaciones
- Revisa carpeta de spam
- Contacta soporte si persiste

## 📞 Siguientes Pasos

Después de que se cree tu caso:

- [Generar Documentos Legales](./documents.md)
- [Comunicación y Chat](../communication/chat.md)
- [Volver al Inicio](../index.md)

---

**¿Necesitas ayuda?** Contacta a nuestro equipo de soporte o revisa nuestra [FAQ](../faq.md).


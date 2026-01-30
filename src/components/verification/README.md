# Sistema de Verificación de Usuarios

## Problemas Solucionados

### 1. Cámara No Funciona
- **Problema**: La cámara no se activaba correctamente
- **Solución**: 
  - Mejorado el hook `useCamera` con mejor manejo de errores
  - Agregado timeout y validaciones de seguridad
  - Mejorado el manejo de permisos del navegador

### 2. Subida de Imágenes Fallida
- **Problema**: Las imágenes base64 de la cámara no se subían correctamente
- **Solución**:
  - Modificado `useVerificationFlow` para manejar tanto archivos como strings base64
  - Agregada validación de tipos de archivo y tamaño
  - Mejorado el logging para debugging

### 3. Botón "Siguiente" Desactivado
- **Problema**: La validación no funcionaba correctamente
- **Solución**:
  - Mejorada la función `canProceed()` en `VerificationWizard`
  - Agregada validación más robusta para cada paso
  - Sincronización correcta entre el contexto y los componentes

## Estructura del Sistema

```
src/components/verification/
├── VerificationWizard.tsx          # Componente principal
├── VerificationFormContext.tsx     # Contexto para estado global
├── DebugPanel.tsx                  # Panel de debug (solo desarrollo)
├── VerificationTest.tsx            # Componente de pruebas
└── steps/
    ├── Step1PersonalData.tsx       # Datos personales
    ├── Step2Discovery.tsx          # Preguntas de descubrimiento
    ├── Step3UserType.tsx           # Tipo de usuario
    ├── Step4Selfie.tsx             # Captura de selfie
    ├── Step5Documents.tsx          # Subida de documentos
    └── Step6Review.tsx             # Revisión final
```

## Hooks Utilizados

### useCamera
- Maneja la funcionalidad de la cámara
- Captura de fotos y subida de archivos
- Validación de tipos de archivo y tamaño

### useVerificationFlow
- Maneja la subida de archivos a Supabase Storage
- Envío de solicitudes de verificación
- Gestión del estado de carga y errores

### useVerificationValidation
- Validación robusta para cada paso
- Mensajes de error específicos
- Validación de edad, archivos y datos requeridos

## Cómo Usar

### 1. Componente Básico
```tsx
import { VerificationWizard } from './components/verification/VerificationWizard';

<VerificationWizard
  onComplete={() => console.log('Verificación completada')}
  onCancel={() => console.log('Verificación cancelada')}
/>
```

### 2. Componente de Pruebas
```tsx
import { VerificationTest } from './components/verification/VerificationTest';

<VerificationTest />
```

## Validaciones Implementadas

### Paso 1 - Datos Personales
- Teléfono requerido y formato válido
- Ubicación requerida
- Fecha de nacimiento requerida
- Edad mínima de 18 años

### Paso 2 - Descubrimiento
- Al menos una opción de "cómo nos encontraste"
- Al menos una opción de "qué quieres hacer"

### Paso 4 - Selfie
- Foto capturada o subida requerida
- Validación de tipo de archivo (imagen)
- Validación de tamaño (máximo 10MB)

### Paso 5 - Documentos
- Cédula de ciudadanía requerida
- Poder notarial requerido si aplica
- Validación de tipos de archivo (imagen/PDF)
- Validación de tamaño (máximo 10MB)

## Debugging

### Panel de Debug
En modo desarrollo, se muestra un panel de debug que muestra:
- Estado actual del formulario
- Archivos subidos
- Errores de validación
- Estado de cada paso

### Logs de Consola
- Logs detallados para debugging de cámara
- Logs de subida de archivos
- Logs de validación

## Requisitos del Navegador

- **HTTPS**: Requerido para acceso a la cámara
- **getUserMedia API**: Para funcionalidad de cámara
- **FileReader API**: Para lectura de archivos
- **Canvas API**: Para captura de fotos

## Navegadores Soportados

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Solución de Problemas

### Cámara No Funciona
1. Verificar que estás en HTTPS
2. Permitir permisos de cámara
3. Cerrar otras aplicaciones que usen la cámara
4. Verificar que el navegador soporte getUserMedia

### Archivos No Se Suben
1. Verificar conexión a internet
2. Verificar permisos de Supabase Storage
3. Verificar que el archivo no exceda 10MB
4. Verificar que el tipo de archivo sea válido

### Botón "Siguiente" Desactivado
1. Verificar que todos los campos requeridos estén completos
2. Usar el panel de debug para ver el estado actual
3. Verificar que no haya errores de validación
4. Verificar que los archivos se hayan subido correctamente

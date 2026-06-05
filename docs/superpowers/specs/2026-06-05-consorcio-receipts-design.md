# Recibos de Consorcio Design

## Objetivo

Agregar una nueva solapa en la aplicación existente llamada `Recibos de Consorcio` para generar recibos de consorcio sin afectar el módulo actual de `Inmobiliaria/Alquiler`.

La nueva sección debe permitir:

- cargar datos de la administración/emisor
- cargar datos del cliente
- administrar uno o varios conceptos bajo la sección `OTROS CONCEPTOS`
- calcular subtotal y total automáticamente
- imprimir un recibo con diseño administrativo similar al actual, pero adaptado a consorcio
- preparar soporte para firma digital por imagen sin exigirla inicialmente

## Estado Actual del Proyecto

La aplicación actual es una app Vite + React + TypeScript con:

- una pantalla principal única montada desde [src/App.tsx](/c:/Users/BRUNO-PC/Documents/GitHub/recibosLopezLamas/src/App.tsx)
- un generador principal de recibos inmobiliarios en [src/generadorRecibo.tsx](/c:/Users/BRUNO-PC/Documents/GitHub/recibosLopezLamas/src/generadorRecibo.tsx)
- tipos actuales en [src/interfaz/index.tsx](/c:/Users/BRUNO-PC/Documents/GitHub/recibosLopezLamas/src/interfaz/index.tsx)
- datos iniciales en [src/data.tsx](/c:/Users/BRUNO-PC/Documents/GitHub/recibosLopezLamas/src/data.tsx)
- helpers de UI, dinero y preview imprimible en [src/helpers/index.tsx](/c:/Users/BRUNO-PC/Documents/GitHub/recibosLopezLamas/src/helpers/index.tsx)

El recibo actual:

- usa estado local en React
- persiste recibos en `localStorage`
- importa Excel para inmobiliaria
- genera el “PDF” mediante la vista imprimible del navegador

No existe backend ni base de datos real en esta versión del proyecto.

## Decisiones de Diseño

### 1. Estrategia de cambio

Se implementará una variante paralela y aislada para consorcio:

- `Inmobiliaria` seguirá funcionando con su flujo actual
- `Consorcio` se agregará como nueva solapa
- cada módulo tendrá su propio estado, guardado local y preview
- se compartirán solo helpers seguros y componentes básicos reutilizables

No se unificará todo bajo un único formulario con `ReceiptType` en esta etapa, porque eso aumentaría el riesgo de regresión sobre el flujo actual.

### 2. Persistencia

Como no hay backend, la nueva funcionalidad usará `localStorage`.

Claves propuestas:

- `recibos_llamas` para inmobiliaria, sin cambios
- `recibos_llamas_consorcio` para recibos guardados de consorcio
- `recibos_llamas_consorcio_config` para la configuración reutilizable del emisor

### 3. Firma digital

La firma se modelará como una imagen opcional por recibo. Si no existe, el recibo mostrará la línea de firma normal. Si existe, se mostrará en el área inferior de firma.

La firma por defecto también podrá formar parte de la configuración reutilizable del emisor para uso futuro.

### 4. Logo

El recibo de consorcio tomará como referencia visual el logo de `PIVA Administración y Servicios`, con estilo sobrio, administrativo y apto para impresión.

## Alcance Funcional

### Nueva navegación

La app mostrará dos solapas:

- `Recibos Inmobiliaria`
- `Recibos de Consorcio`

La navegación debe renderizar cada módulo sin alterar el comportamiento actual del generador de inmobiliaria.

### Formulario de consorcio

El nuevo formulario tendrá cuatro bloques:

1. `Datos de la administración`
2. `Datos del cliente`
3. `Otros conceptos`
4. `Firma y observaciones`

#### Datos de la administración

Campos requeridos o soportados:

- logo
- razón social / nombre
- CUIT
- Ingresos Brutos
- inicio de actividad
- dirección
- texto `de - Cod:` o equivalente
- número de recibo
- fecha

#### Datos del cliente

Campos:

- cliente
- dirección
- localidad
- CUIT / DNI
- IVA

#### Otros conceptos

La sección principal del recibo será `OTROS CONCEPTOS`.

Debe permitir agregar y eliminar filas dinámicamente. Cada fila tendrá:

- descripción
- importe

Ejemplos de contenido permitido:

- `En concepto de pago de expensas de abril 2026`
- `Saldo anterior`
- `Fondo de reserva`
- `Ajuste`
- `Otro concepto libre`

#### Firma y observaciones

Debe soportar:

- imagen de firma opcional para el recibo
- observaciones o notas internas, si el flujo actual ya maneja un patrón similar

## Datos y Tipos

Se agregarán tipos separados para consorcio, manteniendo intactos los actuales.

### Modelo lógico

`ReceiptType`

- `INMOBILIARIA`
- `CONSORCIO`

`ReceiptIssuerConfig`

- `id`
- `type`
- `name`
- `cuit`
- `grossIncome`
- `activityStart`
- `address`
- `codeLabel`
- `logoUrl`
- `defaultSignatureUrl`

`ConsortiumReceipt`

- `id`
- `receiptNumber`
- `date`
- `issuerName`
- `issuerCuit`
- `issuerGrossIncome`
- `issuerActivityStart`
- `issuerAddress`
- `issuerCodeLabel`
- `issuerLogoUrl`
- `clientName`
- `clientAddress`
- `clientLocation`
- `clientTaxId`
- `clientVatCondition`
- `totalAmount`
- `amountInWords`
- `signatureUrl`
- `notes`
- `status`
- `concepts`

`ConsortiumReceiptConcept`

- `id`
- `description`
- `amount`

### Decisión de implementación

En esta app, `concepts` podrá vivir anidado dentro del recibo en estado local y en `localStorage`, sin necesidad de simular relaciones de base de datos separadas.

## Cálculos

El módulo de consorcio calculará:

- subtotal de conceptos
- total final del recibo

Reglas:

- el subtotal es la suma de todos los importes válidos de `OTROS CONCEPTOS`
- el total final será igual al subtotal, salvo que en el futuro se agreguen descuentos/ajustes explícitos
- el total debe recalcularse automáticamente al editar conceptos
- el total debe ser mayor a cero para permitir guardar o imprimir

## Validaciones

Validaciones mínimas obligatorias:

- razón social obligatoria
- cliente obligatorio
- fecha obligatoria
- al menos un concepto obligatorio
- cada concepto debe tener descripción
- cada concepto debe tener importe válido
- total mayor a cero

Comportamiento esperado:

- mostrar errores junto al campo o bloque correspondiente
- impedir guardar o imprimir si el recibo no es válido

## Diseño del Recibo Imprimible

El recibo de consorcio reutilizará la estrategia actual de preview imprimible y duplicado, pero con template separado.

### Estructura visual

- logo arriba a la izquierda
- razón social grande en cabecera
- bloque superior derecho con `RECIBO`, número, fecha, CUIT, Ingresos Brutos e inicio de actividad
- datos del cliente debajo de la cabecera
- una única caja grande de `OTROS CONCEPTOS`
- total del recibo destacado
- firma digital o línea de firma en el pie
- texto `ORIGINAL — Recibí(mos) la suma de: $ ...`

### Restricciones visuales

No deben aparecer en esta variante:

- datos del contrato
- tipo de ajuste
- inicio / finalización
- alquiler
- dirección inmueble
- propietario
- DNI propietario
- facturas de servicios abonados
- Edenor
- Gas
- Agua
- Expensas
- ABL
- Cochera

### Copias

La vista imprimible mostrará:

- `Original`
- `Duplicado`

igual que el flujo actual.

## Estrategia Técnica de Implementación

### Cambios mínimos esperados

Archivos a modificar:

- [src/App.tsx](/c:/Users/BRUNO-PC/Documents/GitHub/recibosLopezLamas/src/App.tsx)
- [src/interfaz/index.tsx](/c:/Users/BRUNO-PC/Documents/GitHub/recibosLopezLamas/src/interfaz/index.tsx)
- [src/data.tsx](/c:/Users/BRUNO-PC/Documents/GitHub/recibosLopezLamas/src/data.tsx)
- [src/helpers/index.tsx](/c:/Users/BRUNO-PC/Documents/GitHub/recibosLopezLamas/src/helpers/index.tsx)

Archivos nuevos probables:

- `src/consortiumReceiptGenerator.tsx`
- `src/consortiumReceiptPreview.tsx`
- `src/consortiumStorage.ts`

### Regla de aislamiento

No se debe:

- cambiar la estructura de `ReceiptData`
- reemplazar el flujo actual de inmobiliaria
- reutilizar las mismas claves de `localStorage`
- mezclar recibos de ambos tipos

### Reutilización permitida

Se podrá reutilizar:

- `money`
- inputs de texto y número
- helpers de normalización y formateo
- bloques visuales genéricos que no acoplen el recibo inmobiliario al de consorcio

## Testing y Verificación Esperada

Antes de cerrar la implementación se deberá comprobar:

- la solapa inmobiliaria sigue funcionando como antes
- la solapa de consorcio valida correctamente
- se pueden agregar y eliminar conceptos
- el total se actualiza en tiempo real
- el logo/configuración persisten al recargar
- el recibo de consorcio imprime `Original` y `Duplicado`
- la ausencia de firma no rompe el layout

## Fuera de Alcance por Ahora

Quedan fuera de esta iteración:

- backend real
- base de datos real
- importación Excel para consorcio
- exportación PDF con librería dedicada
- firma obligatoria
- unificación completa de ambos módulos bajo una arquitectura única

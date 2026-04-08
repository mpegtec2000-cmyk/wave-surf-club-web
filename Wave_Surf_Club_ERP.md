# 🏄‍♂️ WAVE SURF CLUB ERP + POS (Since 2015)

## Arquitectura Full-Stack con Supabase

------------------------------------------------------------------------

## 1. Descripción General

Sistema ERP logístico y POS diseñado para gestionar: - Ventas (POS) -
Inventario - Clientes y deudas - Sucursales - Cierre de caja
automatizado

------------------------------------------------------------------------

## 2. Stack Tecnológico

-   **Frontend:** Next.js (React)
-   **Backend:** Node.js
-   **Base de datos:** Supabase (PostgreSQL)
-   **Autenticación:** Supabase Auth
-   **Seguridad:** Row Level Security (RLS)
-   **Funciones:** Supabase Edge Functions

------------------------------------------------------------------------

## 3. Base de Datos

### Tablas principales

-   `branches`
-   `profiles`
-   `inventory`
-   `transactions`

### Trigger automático

Creación automática de perfil al registrar usuario en Auth.

------------------------------------------------------------------------

## 4. Seguridad (RLS)

-   **Superadmin:** acceso total
-   **Caja:** solo su sucursal
-   **Usuario:** solo su perfil

------------------------------------------------------------------------

## 5. Lógica de Negocio

### Sistema de Deudas

-   Método `por_pagar` → suma deuda
-   `pago_deuda` → resta deuda

### Sistema AV

-   0-3 meses → AV1
-   3-6 meses → AV2
-   6-9 meses → AV3
-   +9 meses → URGENTE (bloqueado)

------------------------------------------------------------------------

## 6. Edge Function - Cierre de Caja

-   Agrupa transacciones del día
-   Calcula balances
-   Genera archivo `.txt`
-   Envía reporte por email

------------------------------------------------------------------------

## 7. Frontend

Módulos: - Login - Dashboard - POS - Inventario - Clientes - Caja

------------------------------------------------------------------------

## 8. Flujo del Sistema

1.  Login
2.  Carga de perfil
3.  Operación
4.  Registro de transacciones
5.  Actualización de deudas
6.  Cierre de caja

------------------------------------------------------------------------

## 9. Escalabilidad

-   Multi sucursal
-   Multi usuario
-   Integración futura e-commerce

------------------------------------------------------------------------

## 10. Mejoras Futuras

-   Dashboard avanzado
-   Pagos online
-   POS offline
-   Auditoría

------------------------------------------------------------------------

## FIN DEL DOCUMENTO

**WAVE SURF CLUB - SINCE 2015**

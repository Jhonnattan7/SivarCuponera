# Base de Datos - LA CUPONERA

Estructura de carpetas y archivos para la gestión de la base de datos PostgreSQL en Supabase.

## Contenido

### `/migrations/`
Migraciones SQL organizadas secuencialmente. Cada archivo representa una fase de la evolución del esquema.

**Uso**: Ejecutar en orden numérico durante inicialización y para nuevas funcionalidades.

Ver [Migraciones README](./migrations/README.md) para instrucciones detalladas.

### Archivos Base

#### `supabase-schema.sql` (Raiz)
Archivo de referencia con el **esquema completo actual**. Combinación de todas las migraciones.

**Propósito**: 
- Documentación visual del esquema final
- Referencia rápida de estructura
- Restauración completa en caso de necesidad

**NO ejecutar directamente** - usar migraciones en `/migrations/` en su lugar.

## Flujo de Trabajo

### Desarrollo Local
```bash
1. Crear rama de feature
2. Añadir migración en /migrations/ (siguiente número)
3. Documentar en README.md
4. Testear en base de datos Supabase de desarrollo
5. Commit e incluir en PR
```

### Despliegue a Producción
```bash
1. Revisar todas las migraciones nuevas
2. Generar backup de base de datos
3. Ejecutar migraciones en orden
4. Verificar integridad con queries de validación
5. Monitorear rendimiento
```

## Conectar a Supabase

### URL de Conexión PostgreSQL
Disponible en Supabase Dashboard → Project Settings → Database

```
postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

### Herramientas Recomendadas
- **Supabase Studio**: SQL Editor en dashboard
- **pgAdmin**: Cliente gráfico de PostgreSQL
- **DBeaver**: IDE de base de datos universal
- **psql CLI**: Cliente de línea de comandos

## Seguridad

⚠️ **Importante**:
- Las migraciones incluyen políticas RLS (Row Level Security)
- Todas las tablas tienen RLS habilitado
- Los usuarios solo ven datos según su rol
- Los secrets/credentials nunca van en Git

## Estadísticas Actuales

- **Tablas**: 5 (categories, companies, profiles, offers, coupons)
- **Vistas**: 3 (companies_public, active_offers, offer_financials)
- **Funciones**: 5 (get_user_role, get_user_company_id, generate_coupon_code, purchase_coupon, expire_coupons)
- **Triggers**: 6 (updated_at en cada tabla principal)
- **Políticas RLS**: 15+

## Próximos Pasos

- [ ] Implementar Edge Function para `expire_coupons()` con Cron schedule
- [ ] Añadir auditoría de cambios (audit log)
- [ ] Optimizar índices según uso real
- [ ] Crear backups automáticos

## Referencias

- [Documentación Supabase](https://supabase.com/docs)
- [PostgreSQL 14+](https://www.postgresql.org/docs)
- [RLS Policy Examples](https://supabase.com/docs/guides/auth/row-level-security)

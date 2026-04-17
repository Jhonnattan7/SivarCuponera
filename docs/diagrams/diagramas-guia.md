# Diagramas Tecnicos

## Estructura recomendada

- `erd.png`: diagrama entidad-relacion general.
- `erd.md`: explicacion textual del diagrama ER.
- `architecture.png`: arquitectura full stack.
- `auth-flow.png`: flujo de autenticacion.
- `roles-flow.png`: flujo por roles.

## Herramientas recomendadas

- dbdiagram.io (ERD rapido desde SQL)
- diagrams.net / draw.io (diagramas de arquitectura y flujo)
- Mermaid (diagramas versionables en Markdown)

## Generar imagenes desde Mermaid

1. Instalar CLI de Mermaid:

```bash
npm i -D @mermaid-js/mermaid-cli
```

2. Crear archivo fuente, por ejemplo `docs/diagrams/architecture.mmd`.

3. Exportar a PNG:

```bash
npx mmdc -i docs/diagrams/architecture.mmd -o docs/diagrams/architecture.png -b transparent -t default
```

4. Exportar a SVG:

```bash
npx mmdc -i docs/diagrams/architecture.mmd -o docs/diagrams/architecture.svg -b transparent -t default
```

5. Para ERD grande, dividir por dominios:

- `erd-core.mmd` (users, profiles, companies)
- `erd-commerce.mmd` (offers, coupons)
- `erd-security.mmd` (RLS, vistas, funciones)

## Extensiones recomendadas en VS Code

- `bierner.markdown-mermaid`
- `shd101wyy.markdown-preview-enhanced`
- `hediet.vscode-drawio`

## Nota

Si el ERD de Supabase no muestra todas las tablas en el navegador lateral, exporta estructura SQL y genera diagramas externos para documentacion completa.

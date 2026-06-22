// apps/web/app/docs/route.ts
import { NextResponse } from 'next/server'
import { openApiSpec } from '@/src/server/docs/openapi.config'

export const dynamic = 'force-dynamic'

const swaggerHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AppBit API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="shortcut icon" href="https://fastapi.tiangolo.com/img/favicon.png" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(openApiSpec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>
`

export async function GET() {
    return new NextResponse(swaggerHtml, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
}
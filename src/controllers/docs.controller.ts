import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';
import { join } from 'node:path';

@ApiExcludeController()
@Controller('docs')
export class DocsController {
  private readonly openapiPath = join(process.cwd(), 'openapi.yaml');

  @Get('openapi.yaml')
  @Header('Cache-Control', 'public, max-age=86400')
  @Header('Content-Type', 'application/yaml')
  getOpenApi(@Res() res: Response): void {
    res.sendFile(this.openapiPath);
  }

  @Get()
  getDocs(@Res() res: Response): void {
    const html = `<!DOCTYPE html>
<html>
  <head>
    <title>Express API Template</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>body { margin: 0; padding: 0; }</style>
  </head>
  <body>
    <redoc spec-url="/docs/openapi.yaml"></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
</html>`;
    res.type('html').send(html);
  }
}

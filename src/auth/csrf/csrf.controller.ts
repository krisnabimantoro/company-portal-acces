import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express'; 
import { generateCsrfToken } from 'src/middleware/csrf';

@Controller('auth/csrf')
export class CsrfController {
  @Get('token')
  getToken(@Req() req: Request, @Res() res: Response) {
    const csrfToken = generateCsrfToken(req, res);

    return res.json({ csrfToken }); // kirim ke frontend
  }
}

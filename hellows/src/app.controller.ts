import { HellowService } from './hellow.service';
import { Controller, Post, Body } from '@nestjs/common';

@Controller('hellow')
export class AppController {
  constructor(private readonly hellowService: HellowService) {}

  @Post('')
  emitHappy(@Body() body: any) {
    this.hellowService.emitUserEvent(body.state, { msg: 'dasd' });
    this.hellowService.emitOrderEvent(body.state, { msg: 'dasd' });
    return;
  }
}

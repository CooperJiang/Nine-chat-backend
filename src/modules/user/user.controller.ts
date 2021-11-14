import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { Body, Controller, Post, Request, Get, Query } from '@nestjs/common';
import { UserRegisterDto } from './dto/register.user.dto';
import { UserLoginDto } from './dto/login.user.dto';

@Controller('/user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  register(@Body() params: UserRegisterDto) {
    return this.userService.register(params);
  }

  @Post('/login')
  login(@Body() params: UserLoginDto) {
    return this.userService.login(params);
  }

  @Get('/getInfo')
  queryInfo(@Request() req) {
    return this.userService.getInfo(req.payload);
  }

  @Get('/query')
  query(@Query() params) {
    return this.userService.query(params);
  }

  @Post('/update')
  update(@Request() req, @Body() params) {
    return this.userService.update(req.payload, params);
  }
}

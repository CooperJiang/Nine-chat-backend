import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { formatDate } from 'src/utils/date';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const {} = response;
    const exceptionRes: any = exception.getResponse();

    /* 正常情况是个对象，为了简写可以只传入一个字符串错误即可 */
    const message =
      exceptionRes.constructor === Object
        ? exceptionRes['message']
        : exceptionRes;
    // const { message } = exceptionRes;
    const statusCode = exception.getStatus() || 400;
    /* 是数组就返回错误里的第一条即可，不是就返回字符串 */
    const errorResponse = {
      message: Array.isArray(message) ? message[0] : message,
      code: statusCode,
      success: false,
      url: request.originalUrl,
      timestamp: new Date().toLocaleDateString(),
    };
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    Logger.error(
      `【${formatDate(Date.now())}】${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      'HttpExceptionFilter',
    );
    console.log(errorResponse, 'errorResponse');

    /* 设置返回的状态码、请求头、发送错误信息 */
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);
  }
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend integration
  app.enableCors({
    origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN?.split(',') || true,
    credentials: process.env.CORS_CREDENTIALS === 'true',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('Tennis Scoreboard API')
    .setDescription('A comprehensive REST API with WebSocket support for managing tennis courts and receiving real-time tennis match scoring data. This API automatically processes complex tennis scoring data and provides simplified, optimized data structures for scoreboard displays.')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API key for authentication. Check your environment variables for valid keys.',
      },
      'api-key',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key',
        description: 'API key for authentication. Check your environment variables for valid keys.',
      },
      'bearer-auth',
    )
    .addTag('courts', 'Tennis court management endpoints')
    .addTag('matches', 'Match management and scoring endpoints')
    .addTag('scoring', 'Main integration endpoints for tennis scoring applications')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Tennis Scoreboard API Documentation',
    customfavIcon: '🎾',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🎾 Tennis Scoreboard API is running on: http://localhost:${port}`);
  console.log(`📡 WebSocket server is available at: ws://localhost:${port}`);
  console.log(`📚 Swagger API Documentation: http://localhost:${port}/api`);
  console.log(`📋 Complete Documentation: See README.md`);
}
bootstrap();

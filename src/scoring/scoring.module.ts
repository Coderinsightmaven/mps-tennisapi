import { Module } from '@nestjs/common';
import { ScoringController } from './scoring.controller';
import { ScoringGateway } from './scoring.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ScoringController],
  providers: [ScoringGateway],
  exports: [ScoringGateway],
})
export class ScoringModule {}

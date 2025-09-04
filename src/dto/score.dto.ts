import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MatchStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED',
}

export class SetScoreDto {
  @ApiProperty({
    description: 'Set number (1, 2, 3, etc.)',
    example: 1
  })
  @IsNumber()
  setNumber: number;

  @ApiProperty({
    description: 'Games won by side 1 in this set',
    example: 6
  })
  @IsNumber()
  side1Score: number;

  @ApiProperty({
    description: 'Games won by side 2 in this set',
    example: 4
  })
  @IsNumber()
  side2Score: number;

  @ApiPropertyOptional({
    description: 'Tiebreak points for side 1 (if applicable)',
    example: 7
  })
  @IsOptional()
  @IsNumber()
  side1TiebreakScore?: number;

  @ApiPropertyOptional({
    description: 'Tiebreak points for side 2 (if applicable)',
    example: 5
  })
  @IsOptional()
  @IsNumber()
  side2TiebreakScore?: number;

  @ApiPropertyOptional({
    description: 'Which side won this set (1 or 2)',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  winningSide?: number;

  @ApiProperty({
    description: 'Whether this set is completed',
    example: true
  })
  @IsBoolean()
  isCompleted: boolean;
}

export class ServerDto {
  @ApiProperty({
    description: 'Which side is serving (1 or 2)',
    example: 1
  })
  @IsNumber()
  sideNumber: number;

  @ApiProperty({
    description: 'Which player on the side is serving',
    example: 1
  })
  @IsNumber()
  playerNumber: number;

  @ApiProperty({
    description: 'ID of the serving player',
    example: 'player123'
  })
  @IsString()
  playerId: string;

  @ApiProperty({
    description: 'Current serving side (DEUCE or AD)',
    example: 'DEUCE',
    enum: ['DEUCE', 'AD']
  })
  @IsString()
  returningSide: string;
}

export class CurrentScoreDto {
  @ApiProperty({
    description: 'Complete score string for side 1',
    example: '6-1 2-6 4-1 (0-0)'
  })
  @IsString()
  scoreStringSide1: string;

  @ApiProperty({
    description: 'Complete score string for side 2',
    example: '1-6 6-2 1-4 (0-0)'
  })
  @IsString()
  scoreStringSide2: string;

  @ApiProperty({
    description: 'Current point score for side 1 (0, 15, 30, 40, AD)',
    example: '30'
  })
  @IsString()
  side1PointScore: string;

  @ApiProperty({
    description: 'Current point score for side 2 (0, 15, 30, 40, AD)',
    example: '15'
  })
  @IsString()
  side2PointScore: string;

  @ApiProperty({
    description: 'Information about the current server',
    type: ServerDto
  })
  @ValidateNested()
  @Type(() => ServerDto)
  server: ServerDto;

  @ApiProperty({
    description: 'Array of set scores',
    type: [SetScoreDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetScoreDto)
  sets: SetScoreDto[];
}

export class MatchScoreUpdateDto {
  @ApiProperty({
    description: 'External match ID from the scoring application',
    example: '74794423-3c57-44e8-96a1-ce5d8954887e'
  })
  @IsString()
  matchId: string;

  @ApiProperty({
    description: 'Current match score information',
    type: CurrentScoreDto
  })
  @ValidateNested()
  @Type(() => CurrentScoreDto)
  score: CurrentScoreDto;

  @ApiProperty({
    description: 'Current status of the match',
    enum: MatchStatus,
    example: MatchStatus.IN_PROGRESS
  })
  @IsEnum(MatchStatus)
  matchStatus: MatchStatus;

  @ApiPropertyOptional({
    description: 'Which side won the match (1 or 2), if completed',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  winningSide?: number;

  @ApiProperty({
    description: 'Timestamp of the score update',
    example: '2025-01-16T10:30:00.000Z'
  })
  @IsString()
  timestamp: string;
}

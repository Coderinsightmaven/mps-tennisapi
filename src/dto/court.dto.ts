import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourtDto {
  @ApiProperty({
    description: 'Name of the tennis court',
    example: 'Center Court'
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the court',
    example: 'Main stadium court'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Surface type of the court',
    example: 'HARD',
    enum: ['HARD', 'CLAY', 'GRASS']
  })
  @IsOptional()
  @IsString()
  surfaceType?: string;

  @ApiPropertyOptional({
    description: 'Whether the court is indoor',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  isIndoor?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the court is active',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CourtDto {
  @ApiProperty({
    description: 'Unique identifier for the court',
    example: '1'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Name of the tennis court',
    example: 'Center Court'
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the court',
    example: 'Main stadium court'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Surface type of the court',
    example: 'HARD'
  })
  @IsOptional()
  @IsString()
  surfaceType?: string;

  @ApiPropertyOptional({
    description: 'Whether the court is indoor',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  isIndoor?: boolean;

  @ApiProperty({
    description: 'Whether the court is active',
    example: true
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'When the court was created',
    example: '2025-01-16T10:00:00.000Z'
  })
  @IsString()
  createdAt: string;

  @ApiProperty({
    description: 'When the court was last updated',
    example: '2025-01-16T10:00:00.000Z'
  })
  @IsString()
  updatedAt: string;
}

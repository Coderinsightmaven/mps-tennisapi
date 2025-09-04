import { IsString, IsOptional, IsNumber } from 'class-validator';

export class PlayerDto {
  @IsString()
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsNumber()
  playerNumber: number;
}

export class SideDto {
  @IsNumber()
  sideNumber: number;

  players: PlayerDto[];
}

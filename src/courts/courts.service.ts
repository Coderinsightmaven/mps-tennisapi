import { Injectable, NotFoundException } from '@nestjs/common';
import { CourtDto, CreateCourtDto } from '../dto/court.dto';

@Injectable()
export class CourtsService {
  private courts: CourtDto[] = [
    {
      id: '1',
      name: 'Center Court',
      description: 'Main stadium court',
      surfaceType: 'HARD',
      isIndoor: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Court 1',
      description: 'Practice court 1',
      surfaceType: 'HARD',
      isIndoor: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Court 2',
      description: 'Practice court 2',
      surfaceType: 'CLAY',
      isIndoor: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  findAll(): CourtDto[] {
    return this.courts.filter(court => court.isActive);
  }

  findOne(id: string): CourtDto {
    const court = this.courts.find(court => court.id === id);
    if (!court) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }
    return court;
  }

  create(createCourtDto: CreateCourtDto): CourtDto {
    const newCourt: CourtDto = {
      id: (this.courts.length + 1).toString(),
      ...createCourtDto,
      isActive: createCourtDto.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.courts.push(newCourt);
    return newCourt;
  }

  update(id: string, updateCourtDto: Partial<CreateCourtDto>): CourtDto {
    const courtIndex = this.courts.findIndex(court => court.id === id);
    if (courtIndex === -1) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }

    const updatedCourt = {
      ...this.courts[courtIndex],
      ...updateCourtDto,
      updatedAt: new Date().toISOString(),
    };

    this.courts[courtIndex] = updatedCourt;
    return updatedCourt;
  }

  remove(id: string): void {
    const courtIndex = this.courts.findIndex(court => court.id === id);
    if (courtIndex === -1) {
      throw new NotFoundException(`Court with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    this.courts[courtIndex].isActive = false;
    this.courts[courtIndex].updatedAt = new Date().toISOString();
  }
}

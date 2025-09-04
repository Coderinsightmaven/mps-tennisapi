import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { CourtsService } from './courts.service';
import { CourtDto, CreateCourtDto } from '../dto/court.dto';
import { ApiKeyGuard } from '../auth/api-key.guard';

@ApiTags('courts')
@ApiSecurity('api-key')
@ApiSecurity('bearer-auth')
@Controller('courts')
@UseGuards(ApiKeyGuard)
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all active courts',
    description: 'Retrieve a list of all active tennis courts available for matches.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of active courts', 
    type: [CourtDto] 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid API key' 
  })
  findAll(): CourtDto[] {
    return this.courtsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get court by ID',
    description: 'Retrieve a specific court by its unique identifier.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Court ID', 
    example: '1' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Court details', 
    type: CourtDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Court not found' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid API key' 
  })
  findOne(@Param('id') id: string): CourtDto {
    return this.courtsService.findOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create new court',
    description: 'Create a new tennis court with the provided details.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Court created successfully', 
    type: CourtDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid API key' 
  })
  create(@Body() createCourtDto: CreateCourtDto): CourtDto {
    return this.courtsService.create(createCourtDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update court',
    description: 'Update an existing court with new information.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Court ID', 
    example: '1' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Court updated successfully', 
    type: CourtDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Court not found' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid API key' 
  })
  update(
    @Param('id') id: string,
    @Body() updateCourtDto: Partial<CreateCourtDto>,
  ): CourtDto {
    return this.courtsService.update(id, updateCourtDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete court',
    description: 'Deactivate a court (soft delete). The court will be marked as inactive but not permanently removed.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Court ID', 
    example: '1' 
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Court deactivated successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Court not found' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid API key' 
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    return this.courtsService.remove(id);
  }
}

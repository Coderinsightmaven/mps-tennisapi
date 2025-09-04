import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam, ApiBody } from '@nestjs/swagger';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { ScoringGateway } from './scoring.gateway';
import { ScoreMapperUtil } from '../utils/score-mapper.util';

@ApiTags('scoring')
@ApiSecurity('api-key')
@ApiSecurity('bearer-auth')
@Controller('scoring')
@UseGuards(ApiKeyGuard)
export class ScoringController {
  // Store received scoring data in memory for WebSocket broadcasting
  private scoreboardData: Map<string, any> = new Map();

  constructor(
    private readonly scoringGateway: ScoringGateway,
  ) {}

  /**
   * Receive complex tennis scoring data from the scoring application
   * This endpoint accepts the full JSON structure you provided
   */
  @Post('update')
  @ApiOperation({
    summary: 'Update match score (Main Integration Endpoint)',
    description: `This is the main endpoint for tennis scoring applications to send match data. 
    It accepts complex JSON structures and automatically maps them to simplified scoreboard data.
    The API will extract essential information and broadcast updates to connected WebSocket clients.`
  })
  @ApiBody({
    description: 'Complex tennis scoring data from your scoring application',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            matchId: { type: 'string', example: '74794423-3c57-44e8-96a1-ce5d8954887e' },
            matchStatus: { type: 'string', example: 'IN_PROGRESS' },
            score: {
              type: 'object',
              properties: {
                scoreStringSide1: { type: 'string', example: '6-1 2-6 4-1 (0-0)' },
                scoreStringSide2: { type: 'string', example: '1-6 6-2 1-4 (0-0)' },
                side1PointScore: { type: 'string', example: '30' },
                side2PointScore: { type: 'string', example: '15' }
              }
            },
            sides: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sideNumber: { type: 'number', example: 1 },
                  players: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        participant: {
                          type: 'object',
                          properties: {
                            first_name: { type: 'string', example: 'John' },
                            last_name: { type: 'string', example: 'Doe' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Score updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        matchId: { type: 'string', example: '74794423-3c57-44e8-96a1-ce5d8954887e' },
        updatedAt: { type: 'string', example: '2025-01-16T10:30:00.000Z' },
        scoreboardData: {
          type: 'object',
          properties: {
            matchId: { type: 'string', example: '74794423-3c57-44e8-96a1-ce5d8954887e' },
            status: { type: 'string', example: 'IN_PROGRESS' },
            side1Player: { type: 'string', example: 'John Doe' },
            side2Player: { type: 'string', example: 'Jane Smith' },
            side1Points: { type: 'string', example: '30' },
            side2Points: { type: 'string', example: '15' },
            sets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  setNumber: { type: 'number', example: 1 },
                  side1Score: { type: 'number', example: 6 },
                  side2Score: { type: 'number', example: 4 },
                  isCompleted: { type: 'boolean', example: true }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid scoring data or missing match ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid API key' })
  receiveScoreUpdate(@Body() rawScoringData: any) {
    try {
      // Extract the match ID from the raw data
      const matchId = rawScoringData.data?.matchId || rawScoringData.matchId || rawScoringData.data?._id;
      
      if (!matchId) {
        return { 
          success: false, 
          error: 'Match ID not found in scoring data' 
        };
      }

      // Extract simplified scoreboard data
      const scoreboardData = ScoreMapperUtil.extractScoreboardData(rawScoringData.data || rawScoringData);
      
      // Store the scoreboard data for retrieval
      this.scoreboardData.set(matchId, {
        ...scoreboardData,
        lastUpdate: new Date().toISOString(),
        rawData: rawScoringData // Keep raw data for reference if needed
      });
      
      // Broadcast the update to all connected clients
      this.scoringGateway.broadcastScoreUpdate(matchId, scoreboardData);
      
      return {
        success: true,
        matchId: matchId,
        updatedAt: new Date().toISOString(),
        scoreboardData: scoreboardData,
      };
      
    } catch (error) {
      console.error('Error processing score update:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get simplified scoreboard data for a specific match
   */
  @Get('scoreboard/:matchId')
  @ApiOperation({
    summary: 'Get scoreboard data',
    description: 'Retrieve simplified scoreboard data for a specific match, optimized for display purposes.'
  })
  @ApiParam({
    name: 'matchId',
    description: 'External match ID from scoring application',
    example: '74794423-3c57-44e8-96a1-ce5d8954887e'
  })
  @ApiResponse({
    status: 200,
    description: 'Scoreboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            matchId: { type: 'string', example: '74794423-3c57-44e8-96a1-ce5d8954887e' },
            status: { type: 'string', example: 'IN_PROGRESS' },
            side1Player: { type: 'string', example: 'John Doe' },
            side2Player: { type: 'string', example: 'Jane Smith' },
            side1Points: { type: 'string', example: '30' },
            side2Points: { type: 'string', example: '15' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Match not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid API key' })
  getScoreboardData(@Param('matchId') matchId: string) {
    try {
      const scoreboardData = this.scoreboardData.get(matchId);
      
      if (!scoreboardData) {
        return {
          success: false,
          error: 'No scoring data found for this match ID. Make sure scoring data has been sent to /scoring/update first.',
        };
      }

      return {
        success: true,
        data: scoreboardData,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test endpoint to validate the mapping with your sample data
   */
  @Post('test-mapping')
  @ApiOperation({
    summary: 'Test data mapping',
    description: 'Test endpoint to validate data mapping without updating any matches. Useful for testing your scoring data format.'
  })
  @ApiBody({
    description: 'Raw tennis scoring data to test mapping',
    schema: {
      type: 'object',
      description: 'Same format as the /scoring/update endpoint'
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Mapping test completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        mappedScoreUpdate: { type: 'object', description: 'Mapped score update object' },
        scoreboardData: { type: 'object', description: 'Simplified scoreboard data' },
        originalDataSize: { type: 'number', example: 15000 },
        simplifiedDataSize: { type: 'number', example: 2000 }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid data format' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid API key' })
  testMapping(@Body() rawScoringData: any) {
    try {
      const scoreUpdate = ScoreMapperUtil.mapToMatchScoreUpdate(rawScoringData);
      const scoreboardData = ScoreMapperUtil.extractScoreboardData(rawScoringData.data || rawScoringData);
      
      return {
        success: true,
        mappedScoreUpdate: scoreUpdate,
        scoreboardData: scoreboardData,
        originalDataSize: JSON.stringify(rawScoringData).length,
        simplifiedDataSize: JSON.stringify(scoreboardData).length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

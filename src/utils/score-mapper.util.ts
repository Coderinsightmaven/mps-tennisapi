import { MatchScoreUpdateDto, MatchStatus, SetScoreDto, ServerDto, CurrentScoreDto } from '../dto/score.dto';
import { SideDto, PlayerDto } from '../dto/player.dto';

/**
 * Utility class to map complex tennis scoring data to simplified DTOs
 */
export class ScoreMapperUtil {
  /**
   * Extract simplified match data from complex tennis scoring JSON
   */
  static mapToMatchScoreUpdate(data: any): MatchScoreUpdateDto {
    const matchData = data.data || data;
    
    return {
      matchId: matchData.matchId || matchData._id,
      score: this.mapToCurrentScore(matchData),
      matchStatus: this.mapMatchStatus(matchData.matchStatus),
      winningSide: matchData.winningSide || undefined,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Map complex score data to simplified current score
   */
  static mapToCurrentScore(matchData: any): CurrentScoreDto {
    const score = matchData.score || {};
    
    return {
      scoreStringSide1: score.scoreStringSide1 || '0-0',
      scoreStringSide2: score.scoreStringSide2 || '0-0',
      side1PointScore: score.side1PointScore || '0',
      side2PointScore: score.side2PointScore || '0',
      server: this.mapToServer(score.server),
      sets: this.mapToSets(score.sets || []),
    };
  }

  /**
   * Map server information
   */
  static mapToServer(serverData: any): ServerDto {
    if (!serverData) {
      return {
        sideNumber: 1,
        playerNumber: 1,
        playerId: '',
        returningSide: 'DEUCE',
      };
    }

    return {
      sideNumber: serverData.sideNumber || 1,
      playerNumber: serverData.playerNumber || 1,
      playerId: serverData.player || serverData.playerId || '',
      returningSide: serverData.returningSide || 'DEUCE',
    };
  }

  /**
   * Map sets information
   */
  static mapToSets(setsData: any[]): SetScoreDto[] {
    return setsData.map((set, index) => ({
      setNumber: set.setNumber || index + 1,
      side1Score: set.side1Score || 0,
      side2Score: set.side2Score || 0,
      side1TiebreakScore: set.side1TiebreakScore || undefined,
      side2TiebreakScore: set.side2TiebreakScore || undefined,
      winningSide: set.winningSide || undefined,
      isCompleted: set.isCompleted || false,
    }));
  }

  /**
   * Map match status from string to enum
   */
  static mapMatchStatus(status: string): MatchStatus {
    switch (status?.toUpperCase()) {
      case 'IN_PROGRESS':
      case 'LIVE_SCORE':
        return MatchStatus.IN_PROGRESS;
      case 'COMPLETED':
      case 'FINISHED':
        return MatchStatus.COMPLETED;
      case 'SUSPENDED':
        return MatchStatus.SUSPENDED;
      default:
        return MatchStatus.NOT_STARTED;
    }
  }

  /**
   * Map sides/players information
   */
  static mapToSides(sidesData: any[]): SideDto[] {
    return sidesData.map(side => ({
      sideNumber: side.sideNumber,
      players: this.mapToPlayers(side.players || []),
    }));
  }

  /**
   * Map players information
   */
  static mapToPlayers(playersData: any[]): PlayerDto[] {
    return playersData.map(playerData => {
      const participant = playerData.participant || {};
      return {
        id: participant._id || participant.id || playerData._id,
        firstName: participant.first_name || participant.firstName || 'Unknown',
        lastName: participant.last_name || participant.lastName || 'Player',
        playerNumber: playerData.playerNumber || 1,
      };
    });
  }

  /**
   * Extract essential scoreboard data for display
   */
  static extractScoreboardData(matchData: any) {
    const score = matchData.score || {};
    const sides = matchData.sides || [];
    
    return {
      matchId: matchData.matchId || matchData._id,
      status: this.mapMatchStatus(matchData.matchStatus),
      
      // Players
      side1Player: this.getPlayerName(sides[0]),
      side2Player: this.getPlayerName(sides[1]),
      
      // Current score
      side1Points: score.side1PointScore || '0',
      side2Points: score.side2PointScore || '0',
      
      // Set scores
      sets: this.mapToSets(score.sets || []),
      
      // Server info
      servingSide: score.server?.sideNumber || 1,
      servingPlayer: score.server?.playerNumber || 1,
      
      // Match info
      format: matchData.matchFormat,
      court: matchData.courtId,
      
      // Time info
      startTime: matchData.startDate,
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * Get player name from side data
   */
  private static getPlayerName(side: any): string {
    if (!side || !side.players || side.players.length === 0) {
      return 'Unknown Player';
    }
    
    const player = side.players[0];
    const participant = player.participant || {};
    const firstName = participant.first_name || participant.firstName || 'Unknown';
    const lastName = participant.last_name || participant.lastName || 'Player';
    
    return `${firstName} ${lastName}`;
  }
}

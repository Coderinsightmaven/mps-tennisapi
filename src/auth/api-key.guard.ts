import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly validApiKeys: string[];

  constructor() {
    // Load API keys from environment variables
    const apiKeysEnv = process.env.API_KEYS || 'sk_dev_default_key,sk_prod_default_key';
    this.validApiKeys = apiKeysEnv.split(',').map(key => key.trim()).filter(key => key.length > 0);
    
    // Log warning if using default keys in production
    if (process.env.NODE_ENV === 'production' && apiKeysEnv.includes('default')) {
      console.warn('⚠️  WARNING: Using default API keys in production! Set API_KEYS environment variable.');
    }
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] || request.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    if (!this.validApiKeys.includes(apiKey)) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }

  // Method to get valid API keys for documentation (without exposing actual keys)
  getApiKeyExamples(): string[] {
    if (process.env.NODE_ENV === 'development') {
      return this.validApiKeys.slice(0, 1); // Return first key for dev testing
    }
    return ['sk_your_api_key_here']; // Generic example for production
  }
}

import {inject} from '@loopback/core';
import {ZenHubQueryService} from '../services';
import {get, param} from '@loopback/rest';

// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';

export class ZenHubQueryController {
  constructor(
    @inject('services.ZenHubQueryService')
    protected zQueryService: ZenHubQueryService,
  ) {}

  @get('zenhub/issue/{issueId}')
  async getZHIssueDetails(
    @param.path.string('issueId') issueId: string,
  ): Promise<string> {
    let repoId = '78452015';
    return await this.zQueryService.getIssueDetails(repoId, issueId);
  }
}

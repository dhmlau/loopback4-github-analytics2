import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {ZenhubdsDataSource} from '../datasources';

export interface ZenHubQueryService {
  // this is where you define the Node.js methods that will be
  // mapped to the SOAP operations as stated in the datasource
  // json file.
  getIssueDetails(repoId: string, issueId: string): Promise<string>;
}

export class ZenHubQueryServiceProvider
  implements Provider<ZenHubQueryService> {
  constructor(
    // zenhubds must match the name property in the datasource json file
    @inject('datasources.zenhubds')
    protected dataSource: ZenhubdsDataSource = new ZenhubdsDataSource(),
  ) {}

  value(): Promise<ZenHubQueryService> {
    return getService(this.dataSource);
  }
}

import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {GithubdsDataSource} from '../datasources';

export interface QueryService {
  // this is where you define the Node.js methods that will be
  // mapped to the SOAP operations as stated in the datasource
  // json file.
  // getPRs(args: QueryParameters): Promise<QueryResponse>;
  getPRs(startdate: string, enddate: string): Promise<QueryResponse>;
}

export interface QueryParameters {
  startdate: string;
  author: string;
  issueState: string;
  isPR: boolean;
}

export interface QueryResponse {
  // result: {
  total_count: number;
  items: PRInfo[];
  // };
}
export class PRInfo {
  url: string;
  state: string;
  user: GitHubUser;
}

export class GitHubUser {
  login: string;
  url: string;
  avatar_url: string;
}

export class QueryServiceProvider implements Provider<QueryService> {
  constructor(
    // githubds must match the name property in the datasource json file
    @inject('datasources.githubds')
    protected dataSource: GithubdsDataSource = new GithubdsDataSource(),
  ) {}

  value(): Promise<QueryService> {
    return getService(this.dataSource);
  }
}

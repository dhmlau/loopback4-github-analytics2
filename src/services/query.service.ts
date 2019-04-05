import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {GithubdsDataSource} from '../datasources';

export interface QueryService {
  // this is where you define the Node.js methods that will be
  // mapped to the SOAP operations as stated in the datasource
  // json file.

  // References: https://help.github.com/en/articles/searching-issues-and-pull-requests#search-within-a-users-or-organizations-repositories
  // repo: for example, strongloop/loopback-next
  // type: pr | issue
  // action: merged | closed | created
  // startdate, enddate: in the format of yyyy-mm-dd
  getPRs(
    repo: string,
    type: string,
    action: string,
    startdate: string,
    enddate: string,
  ): Promise<QueryResponse>;

  getRepoInfo(repo: string): Promise<RepoInfo>;
  getIssueCommentDetails(
    repo: string,
    issueNumber: string,
  ): Promise<IssueComment[]>;
}

// export interface IssueDetailsResponse {
//   comments: IssueComment[];
// }
export interface IssueComment {
  user: string;
  created_at: string;
}

export class RepoInfo {
  name: string;
  html_url: string;
  open_issues_count: number;
}

export interface QueryParameters {
  startdate: string;
  author: string;
  issueState: string;
  isPR: boolean;
}

export interface QueryResponse {
  total_count: number;
  items: PRInfo[];
}
export class PRInfo {
  url: string;
  state: string;
  user: GitHubUser;
  number: number;
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

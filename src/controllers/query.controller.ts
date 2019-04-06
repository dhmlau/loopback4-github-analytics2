import {inject} from '@loopback/core';
import {
  QueryService,
  QueryResponse,
  RepoInfo,
  IssueComment,
  PRInfo,
} from '../services';
import {get, param} from '@loopback/rest';

// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
const maintainerList: string[] = [
  'raymondfeng',
  'bajtos',
  'dhmlau',
  'jannyhou',
  'b-admike',
  'emonddr',
  'nabdelgadir',
  'hacksparrow',
];

export class QueryController {
  constructor(
    @inject('services.QueryService') protected queryService: QueryService,
  ) {}

  @get('issue/{repo}/{startdate}/{enddate}')
  async getAllClosedIssues(
    @param.path.string('repo') repo: string,
    @param.path.string('startdate') startdate: string,
    @param.path.string('enddate') enddate: string,
  ): Promise<QueryResponse> {
    let result: QueryResponse = await this.queryService.getPRs(
      repo,
      'issue',
      'closed',
      startdate,
      enddate,
    );
    return result;
  }

  /**
   * Get the issues opened for the last 30 days
   * @param repo
   * @param startdate
   * @param enddate
   */
  @get('issue/opened/{repo}/{startdate}/{enddate}')
  async getRecentOpenedIssues(
    @param.path.string('repo') repo: string,
    @param.path.string('startdate') startdate: string,
    @param.path.string('enddate') enddate: string,
  ): Promise<QueryResponse> {
    let result: QueryResponse = await this.queryService.getPRs(
      repo,
      'issue',
      'created',
      startdate,
      enddate,
    );
    return result;
  }
  @get('issue/opened/stats/{repo}/{startdate}/{enddate}')
  async getRecentIssueStats(
    @param.path.string('repo') repo: string,
    @param.path.string('startdate') startdate: string,
    @param.path.string('enddate') enddate: string,
  ): Promise<FirstResponseMetrics> {
    let result: QueryResponse = await this.queryService.getPRs(
      repo,
      'issue',
      'created',
      startdate,
      enddate,
    );

    let metrics: FirstResponseMetrics = new FirstResponseMetrics();
    metrics.entries = [];
    let issueDetails: PRInfo[] = result.items;

    for (const item of issueDetails) {
      let issueComments: IssueComment[] = await this.queryService.getIssueCommentDetails(
        repo,
        item.number.toString(),
      );

      console.log('item=', item.number);
      // if (issueComments.length > 0) {
      let issueCommentDetails: IssueCommentDetails = calculateFirstResponseDays(
        repo,
        item.number.toString(),
        item.created_at,
        issueComments,
      );
      metrics = addCounterToFirstRespondEntry(metrics, issueCommentDetails);
      // console.log('!!!! metrics = ', metrics);
      // }
    }

    // console.log('#### metrics = ', metrics);
    return await metrics;
  }

  /**
   * Get all merged PRs
   * @param startdate
   * @param enddate
   */
  @get('/pr/{repo}/{startdate}/{enddate}')
  async getAllMergedPRs(
    @param.path.string('repo') repo: string,
    @param.path.string('startdate') startdate: string,
    @param.path.string('enddate') enddate: string,
  ): Promise<QueryResult> {
    let result: QueryResponse = await this.queryService.getPRs(
      repo,
      'pr',
      'merged',
      startdate,
      enddate,
    );

    let count_maintainers: number = 0;
    let count_community: number = 0;
    let contributorList: Contributor[] = [];

    //TODO need to traverse pagination.

    result.items.forEach(item => {
      if (maintainerList.includes(item.user.login)) {
        count_maintainers++;
      } else {
        count_community++;
      }
      addContribution(contributorList, item.user.login);
    });

    let qr = new QueryResult();
    qr.total_count = result.total_count;
    qr.count_maintainers = count_maintainers;
    qr.count_community = count_community;
    qr.contributions = contributorList;
    return qr;
  }

  /**
   * Get repo information
   * @param startdate
   * @param enddate
   */
  @get('/{repo}')
  async getRepoInfo(
    @param.path.string('repo') repo: string,
  ): Promise<RepoInfo> {
    let result = await this.queryService.getRepoInfo(repo);
    let repoInfo: RepoInfo = new RepoInfo();
    repoInfo.name = result.name;
    repoInfo.html_url = result.html_url;
    repoInfo.open_issues_count = result.open_issues_count;

    return repoInfo;
  }

  //   @get('repo/{repo}/issueComments/{issueNumber}')
  //   async getIssueDetails(
  //     @param.path.string('repo') repo: string,
  //     @param.path.string('issueNumber') issueNumber: string,
  //   ): Promise<IssueCommentDetails> {
  //     let result: IssueComment[] = await this.queryService.getIssueCommentDetails(
  //       repo,
  //       issueNumber,
  //     );
  //     console.log('&&&&&&&&issueComments = ', result.length);
  //     return calculateFirstResponseDays(repo, issueNumber, result);
  //   }
}
function calculateFirstResponseDays(
  repo: string,
  issueNumber: string,
  created_at: string,
  issueComments: IssueComment[],
): IssueCommentDetails {
  // let issueComments: IssueComment[] = await this.queryService.getIssueCommentDetails(
  //   repo,
  //   issueNumber,
  // );
  let issueCommentDetails: IssueCommentDetails = new IssueCommentDetails();
  issueCommentDetails.repo = repo;
  issueCommentDetails.issueNumber = issueNumber;

  // Assume the issue comments are sorted by created_at date
  let createDate: Date = new Date(created_at);
  // let createDate: Date = new Date(issueComments[0].created_at);
  let firstRespondDate: Date = new Date();
  // console.log('issueComments=', issueComments[0]);
  if (issueComments.length !== 0) {
    firstRespondDate = new Date(issueComments[0].created_at);
  }
  let diff = Math.abs(firstRespondDate.getTime() - createDate.getTime());
  issueCommentDetails.days_firstRespond = Math.ceil(diff / (1000 * 3600 * 24));
  console.log('diff=', issueCommentDetails.days_firstRespond);
  return issueCommentDetails;
}
function addCounterToFirstRespondEntry(
  metrics: FirstResponseMetrics,
  issueCommentDetails: IssueCommentDetails,
): FirstResponseMetrics {
  let numOfDays = issueCommentDetails.days_firstRespond;
  let found = false;
  metrics.entries.forEach(entry => {
    if (entry.num_of_days === numOfDays) {
      entry.num_of_issues++;
      found = true;
    }
  });
  if (!found) {
    let entry: FirstResponseMetricsEntry = new FirstResponseMetricsEntry();
    entry.num_of_days = numOfDays;
    entry.num_of_issues = 1;
    metrics.entries[metrics.entries.length] = entry;
  }
  return metrics;
}

function addContribution(contributors: Contributor[], userId: string): void {
  let found: boolean = false;

  for (let contributor of contributors) {
    if (contributor.userId === userId) {
      contributor.count_contribution++;
      found = true;
      break;
    }
  }
  if (!found) {
    let c: Contributor = new Contributor();
    c.userId = userId;
    c.count_contribution = 1;
    contributors.push(c);
  }
}

class IssueCommentDetails {
  repo: string;
  issueNumber: string;
  days_firstRespond: number;
}

class FirstResponseMetrics {
  entries: FirstResponseMetricsEntry[];
}

class FirstResponseMetricsEntry {
  num_of_days: number;
  num_of_issues: number;
}
class IssueDetails {
  repo: string;
  issueNumber: number;
}

class QueryResult {
  total_count: number;
  count_community: number;
  count_maintainers: number;
  contributions: Contributor[];
}

class Contributor {
  userId: string;
  count_contribution: number;
}

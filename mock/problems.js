import { delay } from 'roadhog-api-doc';
import { success, failure, randomSuccessOrFailure, randomResponse } from './utils/MockResponse';

const proxy = {
  'GET /api2/problems': success({
    page: 1,
    total: 2,
    limit: 10,
    rows: [
      {
        problemId: 1000,
        title: 'A+B Problem',
        source: 'SDUT',
        author: 'SDUT',
        tags: [],
        createdAt: 1537248964,
        updatedAt: 1537248999,
        accepted: 99,
        submitted: 110,
        solved: false,
      },
      {
        problemId: 1001,
        title: 'Comparison',
        source: 'Contest',
        author: 'bLue',
        tags: [1, 2],
        createdAt: 1537248900,
        updatedAt: 1537248920,
        accepted: 0,
        submitted: 1,
        solved: true,
      },
      {
        problemId: 1002,
        title: 'A Simple DP',
        source: 'Contest',
        author: 'Author 2',
        tags: [3],
        createdAt: 1537248900,
        updatedAt: 1537248920,
        accepted: 5,
        submitted: 12,
        solved: true,
      },
    ],
  }),
  'GET /api2/problems/1000': success({
    problemId: 1000,
    title: 'Title 1000',
    description: '<p>HAHA</p>\n<img src="https://images.all-free-download.com/images/graphiclarge/beautiful_rainbow_paint_design_vector_548029.jpg" />',
    input: 'Input',
    output: 'Output',
    sampleInput: '1 2 This is test code',
    sampleOutput: '1, 2\n3\nTest for(int i=0; i<3; ++i) {}\n1234567890\nabcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz',
    hint: 'Hint',
    source: 'Source',
    author: 'Author',
    tags: [],
    timeLimit: 1000,
    memoryLimit: 65536,
    createdAt: 1537248964,
    updatedAt: 1537248999,
    accepted: 1,
    submitted: 10,
    solved: false,
    attempted: true,
  }),
  'GET /api2/problems/1001': success({
    problemId: 1001,
    title: 'Comparison',
    description: `<p>Now there are two integers <em><strong>a</strong></em> and <em><strong>b</strong></em>. You need to compare <em><strong>a</strong></em> and <em><strong>b</strong></em>.</p><br/>
<img src="https://images.all-free-download.com/images/graphiclarge/beautiful_rainbow_paint_design_vector_548029.jpg" />`,
    input: `<p>The input contains several test cases (no more than 1000 cases), and terminates with&nbsp;EOF.</p>
<p>For each case, it contains two integers&nbsp;<em>a</em>, <em>b</em> (0 &lt;= <em>a</em>, <em>b</em> &lt; 10^1000) separated by spaces in one line.</p>
`,
    output: `<p>For each case:</p>
<ul>
  <li>If <em>a</em> is less than <em>b</em>, output &quot;a&lt;b&quot;</li>
  <li>if <em>a</em> is equal to <em>b</em>, output &quot;a=b&quot;</li>
  <li>if <em>a</em> is greater than <em>b</em>, output &quot;a&gt;b&quot;</li>
</ul>
`,
    sampleInput: `123 123
2333 2233
666 6666`,
    sampleOutput: `a=b
a>b
a<b`,
    hint: '',
    source: 'Contest',
    author: 'bLue',
    tags: [1, 2],
    timeLimit: 1000,
    memoryLimit: 65536,
    createdAt: 1537248900,
    updatedAt: 1537248920,
    accepted: 0,
    submitted: 1,
    solved: true,
    attempted: true,
  }),
  'GET /api2/problems/301': failure(401),
  'GET /api2/problems/302': failure(402),
};

export default delay(proxy, 250);

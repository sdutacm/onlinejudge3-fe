'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.join(__dirname, '../../src/pages/competitions-public/$id/participants.tsx'),
  'utf-8',
);

test('competition public participants SSR prefetches detail and participant rows', () => {
  assert.match(source, /import \{ withSSRPrefetch \} from '@\/utils\/ssr';/);
  assert.match(source, /initialParticipants\?: ICompetitionUser\[\];/);
  assert.match(source, /participantsLoaded: Array\.isArray\(props\.initialParticipants\)/);
  assert.match(source, /type: 'competitions\/getDetail'/);
  assert.match(source, /type: 'competitions\/getPublicCompetitionParticipants'/);
  assert.match(source, /initialParticipants: ret\?\.success \? ret\.data\.rows : undefined/);
  assert.match(
    source,
    /export default withSSRPrefetch\(\s*connect\(mapStateToProps\)\(CompetitionParticipants\)/,
  );
});

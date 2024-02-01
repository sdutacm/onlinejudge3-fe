import { randomlyPickOne } from './misc';

export function pickGenshinAudioUrlFromConf(mediaConf: {
  urls: string[];
  play: 'one' | 'all';
  playMode: 'random' | 'sequence';
}): string | undefined {
  if (!mediaConf) {
    return undefined;
  }
  const { urls, play, playMode } = mediaConf;
  const toUseOnEnteredAudioUrl = playMode === 'random' ? randomlyPickOne(urls) : urls[0];
  return toUseOnEnteredAudioUrl;
}

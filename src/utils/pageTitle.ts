import constants from '@/configs/constants';

export function formatPageTitle(title: string | null, loading: boolean = false): string {
  if (loading) {
    return `</> | ${constants.siteTitle}`;
  }
  return title ? `${title} | ${constants.siteTitle}` : constants.siteTitle;
}

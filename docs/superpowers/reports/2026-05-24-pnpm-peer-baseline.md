# pnpm Peer Dependency Baseline - 2026-05-24

This baseline records known peer dependency warnings after moving the project to pnpm. These warnings are accepted in this phase because the runtime stack intentionally remains on React 17 with older React 16-era packages.

## Command

```bash
pnpm peers check
```

## Summary

Exit status: 1

A non-zero exit status is expected for this baseline and is not a CI gate in this phase.

## Output

```text
Issues with peer dependencies found

✕ unmet peer react
  Installed: 17.0.2
  Wanted:
    "^0.14.0 || ^15.0.0 || ^16.0.0-beta || ^16.0.0":
      redbox-react@1.6.0
    ^16.3.0:
      react-intl@3.12.1
    16.x:
      @ant-design/icons-react@1.1.5
    "^0.14.0 || ^15.0.0 || ^16.0.0":
      create-react-context@0.2.2
      react-calendar-heatmap@1.8.1
    "^0.14.0 || ^15.0.0-rc || ^16.0.0-rc || ^16.0.0":
      draft-js@0.10.5
    ^16.0.0:
      rc-switch@1.8.0
      braft-convert@2.3.0
    "^0.14.0 || ^15.0.0-0 || ^16.0.0":
      react-lazy-load@3.1.13
    "^0.14.0 || ^15.0.1 || ^16.0.0":
      react-slick@0.23.2
    "^15.0.2|| ^16.0.0-rc || ^16.0.0":
      braft-editor@2.3.9
    ^16.4.1:
      braft-finder@0.0.19
    ^16.8.4:
      dva@2.6.0-beta.23
    ^16.4.0:
      connected-react-router@6.5.2
    "^0.14.0 || ^15.0.0 || ^16.0.0 || ^18.0.0":
      react-autolatex@2.0.1
    "^0.13.0 || ^0.14.0 || ^15.0.0 || ^16.0.0":
      react-side-effect@1.2.0
    "^15.6.2 || ^16.0":
      react-ga@2.7.0
    "^15.0.0 || ^16.0.0":
      react-markdown@3.6.0
    >=^16.0.0:
      react-tooltip@3.11.6

✕ unmet peer react-dom
  Installed: 17.0.2
  Wanted:
    "^0.14.0 || ^15.0.0 || ^16.0.0-beta || ^16.0.0":
      redbox-react@1.6.0
    "^0.14.0 || ^15.0.0-rc || ^16.0.0-rc || ^16.0.0":
      draft-js@0.10.5
    ^16.0.0:
      rc-switch@1.8.0
    "^0.14.0 || ^15.0.0-0 || ^16.0.0":
      react-lazy-load@3.1.13
    "^0.14.0 || ^15.0.1 || ^16.0.0":
      react-slick@0.23.2
    "^15.0.2|| ^16.0.0-rc || ^16.0.0":
      braft-editor@2.3.9
    ^16.4.1:
      braft-finder@0.0.19
    ^16.8.4:
      dva@2.6.0-beta.23
    >=^16.0.0:
      react-tooltip@3.11.6

✕ unmet peer dva-core
  Installed: 2.0.4
  Wanted:
    "^1.1.0 || ^1.5.0-0 || ^1.6.0-0":
      dva-loading@3.0.25
```
